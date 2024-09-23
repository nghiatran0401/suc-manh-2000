const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const { v4: uuidv4 } = require("uuid");
const marked = require("marked");
const slugify = require("slugify");
const { getProjectStatus, standardizeString, extractFolderId } = require("./updateDuAnFromAirtableToWeb");
const { getProjectProgress } = require("./googledrive");
const { firestore, firebase } = require("./firebase");
const { upsertDocumentToIndex } = require("../server/services/redis");
const { updateClassificationAndCategoryCounts } = require("../server/utils");

const oldProjects = {};
const newProjects = {};

function formatDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function readCSV(filePath, projectMap, requestedYears) {
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => {
        const trimmedData = {};
        for (const key in data) {
          if (data.hasOwnProperty(key)) {
            trimmedData[key.trim()] = data[key];
          }
        }

        const year = trimmedData["Năm thực hiện"];
        const projectId = trimmedData["DA"].trim();
        const projectName = standardizeString(`${projectId} - ${trimmedData["Tên công trình"]}`);
        const projectStatus = getProjectStatus(trimmedData["Follow up Step"].trim());

        if (trimmedData["Tên công trình"].includes("❌")) return;

        if (!year || !requestedYears.includes(year)) return;
        if (projectStatus === undefined) return;

        projectMap[projectId] = {
          projectId: projectId,
          name: projectName,
          classification: trimmedData["Phân loại công trình"],
          status: projectStatus,
          totalFund: Number(trimmedData["Trị giá tiền"].replace("VNĐ ", "")),
          url: trimmedData["Link Drive"].trim(),
          donors: trimmedData["Donors - CHỐT"]
            .split(",")
            .filter((d) => d)
            .map((donor) => ({ name: donor.replace(/[\b]/g, "").trim() })),
          location: {
            province: trimmedData["Tỉnh/thành (update)"].includes("Tỉnh") ? trimmedData["Tỉnh/thành (update)"].replace("Tỉnh", "").trim() : trimmedData["Tỉnh/thành (update)"].trim(),
            district: trimmedData["Huyện"].includes("Huyện") ? trimmedData["Huyện"].replace("Huyện", "").trim() : trimmedData["Huyện"].trim(),
            commune: trimmedData["Xã"].includes("Xã") ? trimmedData["Xã"].replace("Xã", "").trim() : trimmedData["Xã"].trim(),
          },
          metadata: {
            constructionItems: trimmedData["Hạng mục công trình"] ? trimmedData["Hạng mục công trình"].trim() : null,
            type: trimmedData["Hạng mục"] ? trimmedData["Hạng mục"].trim() : null,
            stage: trimmedData["Cấp"] ? (trimmedData["Cấp"].includes("Cấp") ? trimmedData["Cấp"].replace("Cấp", "").trim() : trimmedData["Cấp"].trim()) : null,
            totalStudents: trimmedData["Số HS"] ? (trimmedData["Số HS"].trim() === "" ? null : Number(trimmedData["Số HS"].trim())) : null,
            totalClassrooms: trimmedData["Số PH"] ? (trimmedData["Số PH"].trim() === "" ? null : Number(trimmedData["Số PH"].trim())) : null,
            totalPublicAffairsRooms: trimmedData["Số CV"] ? (trimmedData["Số CV"].trim() === "" ? null : Number(trimmedData["Số CV"].trim())) : null,
            totalRooms: trimmedData["Số p.ở"] ? (trimmedData["Số p.ở"].trim() === "" ? null : Number(trimmedData["Số p.ở"].trim())) : null,
            totalKitchens: trimmedData["Số bếp"] ? (trimmedData["Số bếp"].trim() === "" ? null : Number(trimmedData["Số bếp"].trim())) : null,
            totalToilets: trimmedData["Số WC"] ? (trimmedData["Số WC"].trim() === "" ? null : Number(trimmedData["Số WC"].trim())) : null,
            start_date: trimmedData["Ngày KC"] ? (trimmedData["Ngày KC"].trim() === "" ? null : trimmedData["Ngày KC"].trim()) : null,
            end_date: trimmedData["Ngày KT"] ? (trimmedData["Ngày KT"].trim() === "" ? null : trimmedData["Ngày KT"].trim()) : null,
          },
          isInProgress: trimmedData["Ảnh Tiến độ (check)"] ?? null,
          progressNote: trimmedData["Note tiến độ"] ?? null,
          url: trimmedData["Link Drive"].trim(),
          year: year,
        };
      })
      .on("end", () => {
        resolve();
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

function compareProjects(oldProject, newProject, attributes) {
  const differences = [];

  function compareObjects(obj1, obj2, parentKey = "") {
    for (const key in obj1) {
      const fullKey = parentKey ? `${parentKey}.${key}` : key;
      if (typeof obj1[key] === "object" && obj1[key] !== null && typeof obj2[key] === "object" && obj2[key] !== null) {
        compareObjects(obj1[key], obj2[key], fullKey);
      } else if (obj1[key] !== obj2[key]) {
        differences.push({ key: fullKey, oldValue: obj1[key], newValue: obj2[key] });
      }
    }
  }

  compareObjects(oldProject, newProject);
  return attributes.length === 0 ? differences : differences.filter((diff) => attributes.includes(diff.key));
}

async function compareCSVFiles(requestedYears, attributes) {
  const oldCSVPath = path.resolve(__dirname, "./projects-old.csv");
  const newCSVPath = path.resolve(__dirname, "./projects-new.csv");
  await Promise.all([readCSV(oldCSVPath, oldProjects, requestedYears), readCSV(newCSVPath, newProjects, requestedYears)]);

  const order = [
    { id: 0, name: "dự án mới khởi công" },
    { id: 1, name: "dự án đã khởi công nhưng chưa có tiến độ" },
    { id: 2, name: "dự án đang được xây dựng" },
    // { id: 3, name: "dự án đã hoàn thành" },
  ];
  const sections = {
    0: [],
    1: [],
    2: [],
    // 3: [],
  };
  const countProjects = {
    2023: {
      total: 0,
      inProgress: 0,
      completed: 0,
    },
    2024: {
      total: 0,
      inProgress: 0,
      completed: 0,
    },
  };

  // Categorize report projects based on the order/sections
  for (const projectId in newProjects) {
    if (newProjects[projectId]) {
      const oldProject = oldProjects[projectId];
      const newProject = newProjects[projectId];
      const differences = compareProjects(oldProject, newProject, attributes);

      if (requestedYears.includes(newProject.year) && ["dang-xay-dung", "da-hoan-thanh"].includes(newProject.status)) {
        countProjects[newProject.year].total++;
      }

      if (differences.length > 0) {
        if (oldProject.status === "can-quyen-gop" && newProject.status === "dang-xay-dung") {
          sections[0].push({ projectId, name: oldProject.name, differences });
          countProjects[newProject.year].inProgress++;
          continue;
        }
        // if (oldProject.status === "dang-xay-dung" && newProject.status === "da-hoan-thanh") {
        //   sections[3].push({ projectId, name: oldProject.name, differences });
        //   continue;
        // }
      }

      if (newProject.status === "dang-xay-dung" && newProject.isInProgress === "") {
        sections[1].push({ projectId, name: oldProject.name, differences: [{ key: "progressNote", newValue: newProject["progressNote"] }] });
        countProjects[newProject.year].inProgress++;
        continue;
      }
      if (newProject.status === "dang-xay-dung" && newProject.isInProgress === "checked") {
        sections[2].push({ projectId, name: oldProject.name, differences: [{ key: "progressNote", newValue: newProject["progressNote"] }] });
        countProjects[newProject.year].inProgress++;
        continue;
      }
    }
  }

  // Generate HTML content
  let htmlContent = ``;

  htmlContent += `<p style="font-weight: bold;">Thống kê số liệu</p>`;
  htmlContent += `<p style="font-weight: bold;">Năm 2023</p>`;
  htmlContent += `<ul style="list-style-type: disc; padding-left: 20px;">`;
  htmlContent += `<li>Tổng dự án đã khởi công: <strong>${countProjects[2023].total - 1}</strong></li>`; // -1 vì abc (hỏi c Yến)
  htmlContent += `<li>Tổng dự án đã hoàn thành: <strong>${countProjects[2023].total - countProjects[2023].inProgress - 1}</strong></li>`;
  htmlContent += `<li>Tổng dự án đang được xây: <strong>${countProjects[2023].inProgress}</strong></li>`;
  htmlContent += `</ul>`;
  htmlContent += `<p style="font-weight: bold;">Năm 2024</p>`;
  htmlContent += `<ul style="list-style-type: disc; padding-left: 20px;">`;
  htmlContent += `<li>Tổng dự án đã khởi công: <strong>${countProjects[2024].total}</strong></li>`;
  htmlContent += `<li>Tổng dự án đã hoàn thành: <strong>${countProjects[2024].total - countProjects[2024].inProgress}</strong></li>`;
  htmlContent += `<li>Tổng dự án đang được xây: <strong>${countProjects[2024].inProgress}</strong></li>`;
  htmlContent += `</ul>`;

  for (const section of order) {
    if (sections[section.id].length > 0) {
      htmlContent += `<p style="font-weight: bold;">${sections[section.id].length} ${section.name}</p>`;

      htmlContent += `<ul style="list-style-type: disc; padding-left: 20px;">`;
      for (const project of sections[section.id]) {
        htmlContent += `<li>${project.name} `;

        if (section.id === 0) {
          htmlContent += `</li>`;
        }

        for (const diff of project.differences) {
          if (section.id === 1 && diff.key === "progressNote") {
            htmlContent += `=> ${diff.newValue}</li>`;
          } else if (section.id === 2) {
            continue;
          }
        }

        if (section.id === 2) {
          htmlContent += `</li>`;
        }
      }
      htmlContent += `</ul>`;

      if (section.id === 2) {
        htmlContent += `<p style="font-style: italic; text-align: center;">(Chi tiết xem từng ảnh phía dưới)</p>`;
      }
    }
  }

  // Generate progress images
  const slideshowImages = [];
  for (const project of sections[2]) {
    const projectId = project.projectId;
    const projectUrl = newProjects[projectId].url;
    const projectProgress = await getProjectProgress(extractFolderId(projectUrl));
    const tienDoItem = projectProgress.find((p) => p.name === "Ảnh tiến độ");

    if (!tienDoItem || tienDoItem.images.length === 0) {
      console.log(`No progress images found ${projectId}`);
      continue;
    }

    const latestImage = tienDoItem.images.reduce((latest, image) => {
      return new Date(image.createdTime) > new Date(latest.createdTime) ? image : latest;
    });

    slideshowImages.push({
      image: `${latestImage.image}&sz=w1000`,
      caption: project.name,
    });
  }

  // Post to Firestore
  const today = new Date();
  const last7Days = new Date(today);
  last7Days.setDate(today.getDate() - 6);
  const newId = uuidv4().replace(/-/g, "").substring(0, 20);
  const title = `Dự Án Sức Mạnh 2000 Cập Nhật Tiến Độ Các Dự Án Trong Tuần Từ Ngày ${formatDate(last7Days)} Đến Ngày ${formatDate(today)}`;
  const category = "thong-bao";
  const news = {
    id: newId,
    name: title,
    author: "Admin",
    publish_date: firebase.firestore.Timestamp.fromDate(new Date()),
    slug: slugify(title, { lower: true, strict: true }),
    thumbnail: slideshowImages[0].image,
    category: category,
    content: {
      tabs: [
        {
          name: "Hoàn cảnh",
          description: htmlContent,
          slide_show: slideshowImages,
        },
      ],
    },
  };

  console.log("Writing to Firestore...");
  // console.log(news.content.tabs[0]);

  await Promise.all([
    firestore.collection(category).doc(newId).set(news),
    upsertDocumentToIndex({ ...news, collection_id: category, doc_id: newId }),
    updateClassificationAndCategoryCounts(news.classification, news.category, +1),
  ]);

  console.log("Create post news successfully!!!!");
  process.exit(0);
}

compareCSVFiles(["2023", "2024"], ["status"]);

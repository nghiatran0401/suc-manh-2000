const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const { getProjectStatus, standardizeString, extractFolderId } = require("./updateDuAnFromAirtableToWeb");
const { getProjectProgress } = require("./googledrive");

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
    { id: 3, name: "dự án đã hoàn thành" },
  ];
  const sections = {
    0: [],
    1: [],
    2: [],
    3: [],
  };

  // Categorize report projects based on the order/sections
  for (const projectId in newProjects) {
    if (newProjects[projectId]) {
      const oldProject = oldProjects[projectId];
      const newProject = newProjects[projectId];
      const differences = compareProjects(oldProject, newProject, attributes);

      if (differences.length > 0) {
        if (oldProject.status === "can-quyen-gop" && newProject.status === "dang-xay-dung") {
          sections[0].push({ projectId, name: oldProject.name, differences });
          continue;
        }
        if (oldProject.status === "dang-xay-dung" && newProject.status === "da-hoan-thanh") {
          sections[3].push({ projectId, name: oldProject.name, differences });
          continue;
        }
      }

      if (newProject.status === "dang-xay-dung" && newProject.isInProgress === "") {
        sections[1].push({ projectId, name: oldProject.name, differences: [{ key: "progressNote", newValue: newProject["progressNote"] }] });
      }
      if (newProject.status === "dang-xay-dung" && newProject.isInProgress === "checked") {
        sections[2].push({ projectId, name: oldProject.name, differences: [{ key: "progressNote", newValue: newProject["progressNote"] }] });
      }
    }
  }

  // Generate Markdown content
  const today = new Date();
  const last7Days = new Date(today);
  last7Days.setDate(today.getDate() - 7);
  let markdownContent = `# Báo cáo tiến độ tuần ${formatDate(last7Days)} - ${formatDate(today)}\n\n`;

  for (const section of order) {
    if (sections[section.id].length > 0) {
      markdownContent += `## ${sections[section.id].length} ${section.name}\n`;
      markdownContent += "\n";

      for (let projectIndex = 0; projectIndex < sections[section.id].length; projectIndex++) {
        const project = sections[section.id][projectIndex];

        markdownContent += `- ${project.name} `;

        if ([0, 3].includes(section.id)) {
          markdownContent += "\n";
        }

        for (const diff of project.differences) {
          if (section.id === 1 && diff.key === "progressNote") {
            markdownContent += `=> ${diff.newValue} \n`;
          } else if (section.id === 2) {
            continue;
          }
        }

        if (section.id === 2) {
          markdownContent += "\n";
        }
      }
      markdownContent += "\n";
      if (section.id === 2) {
        markdownContent += `#### (Chi tiết xem từng ảnh phía dưới)\n\n`;
      }
    }
  }

  // Generate progress images
  markdownContent += "\n";
  for (let projectIndex = 0; projectIndex < sections[2].length; projectIndex++) {
    const project = sections[2][projectIndex];

    const projectProgress = await getProjectProgress(extractFolderId(newProjects[project.projectId].url));
    const tienDoItem = projectProgress.find((p) => p.name === "Ảnh tiến độ");
    if (tienDoItem.images.length === 0) {
      console.log(`No progress images found ${project.projectId}`);
      continue;
    }
    const tienDoImage = tienDoItem.images[0].image + "&sz=w1000";
    markdownContent += `![${project.projectId}](${tienDoImage})\n`;
    markdownContent += `**${project.name}**\n\n`;
  }

  fs.writeFileSync(path.resolve(__dirname, "report.md"), markdownContent);
  console.log("Markdown content generated successfully.");
  process.exit(0);
}

compareCSVFiles(["2023", "2024"], ["status"]);

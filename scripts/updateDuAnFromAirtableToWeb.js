const path = require("path");
const fs = require("fs");
const csv = require("csv-parser");
const { v4: uuidv4 } = require("uuid");
const slugify = require("slugify");
const { firestore, firebase } = require("./firebase");
const { getProjectProgress, getHoanCanhDescription } = require("./googledrive");
const { upsertDocumentToIndex } = require("../server/services/redis");
const { updateClassificationAndCategoryCounts } = require("../server/utils");

const markdownFilePath = path.resolve(__dirname, "project-updates.md");
function appendToMarkdownFile(content) {
  fs.appendFileSync(markdownFilePath, content + "\n", "utf8");
}

function deleteExistingMarkdownFile() {
  if (fs.existsSync(markdownFilePath)) {
    fs.unlinkSync(markdownFilePath);
  }
}

function extractFolderId(ggDriveUrl) {
  const match = ggDriveUrl.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  const folderId = match ? match[1] : undefined;
  return folderId;
}

function getProjectClassification(classification) {
  switch (classification) {
    case "Trường":
      return "truong-hoc";
    case "Khu Nội Trú":
      return "khu-noi-tru";
    case "Nhà Hạnh Phúc":
      return "nha-hanh-phuc";
    case "Cầu":
      return "cau-hanh-phuc";
    case "WC":
      return "wc";
    default:
      return null;
  }
}

function getProjectStatus(statusFull) {
  if (!statusFull.match(/^\d+/)) return undefined;

  const statusNumber = parseInt(statusFull.match(/^\d+/)[0], 10);
  if (statusNumber >= 0 && statusNumber <= 10) {
    return "can-quyen-gop";
  } else if (statusNumber >= 11 && statusNumber <= 12) {
    return "dang-xay-dung";
  } else if (statusNumber >= 13) {
    return "da-hoan-thanh";
  } else {
    return null;
  }
}

function reportIfProjectHasEmptyFields(totalAirtableData) {
  const errorProject = { id: "", emptyFields: [] };

  for (const airtableData of totalAirtableData) {
    for (const key in airtableData) {
      if (airtableData.hasOwnProperty(key) && !airtableData[key]) {
        errorProject["id"] = airtableData.projectId;
        errorProject["emptyFields"].push(key);
      }
    }
  }

  if (errorProject["emptyFields"].length > 0) {
    console.log("Error project: ", errorProject);
    return true;
  }
  return false;
}

function standardizeString(str) {
  return str
    .split(" ")
    .map((word, index, arr) => {
      if (word.includes("DA")) {
        return word.toUpperCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ")
    .replace(/,/g, " -");
}

async function updateDuAnFromAirtableToWeb(requestedYear) {
  const csvFilePath = path.resolve(__dirname, "./projects-new.csv");
  const results = { [requestedYear]: [] };

  const readCSV = () => {
    return new Promise((resolve, reject) => {
      const data = [];
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on("data", (row) => {
          data.push(row);
        })
        .on("end", () => {
          resolve(data);
        })
        .on("error", (error) => {
          reject(error);
        });
    });
  };

  try {
    const data = await readCSV();

    for (const row of data) {
      const trimmedData = {};
      for (const key in row) {
        if (row.hasOwnProperty(key)) {
          trimmedData[key.trim()] = row[key];
        }
      }
      const year = trimmedData["Năm thực hiện"];
      const projectId = trimmedData["DA"].trim();
      const projectName = standardizeString(`${projectId} - ${trimmedData["Tên công trình"]}`);
      const projectStatus = getProjectStatus(trimmedData["Follow up Step"].trim());
      const projectProgressImagesUrl = trimmedData["Link Drive"].trim();

      if (!year || year !== requestedYear) continue;
      if (trimmedData["Tên công trình"].includes("❌")) {
        console.log("Cancelled: ", projectId);
        continue;
      }
      if (projectStatus === undefined) {
        console.log("No status: ", projectId);
        continue;
      }
      if (!projectProgressImagesUrl) {
        console.log("No progress images: ", projectId);
        continue;
      }

      results[requestedYear].push({
        projectId: projectId,
        name: projectName,
        classification: trimmedData["Phân loại công trình"],
        status: projectStatus,
        totalFund: Number(trimmedData["Trị giá tiền"].replace("VNĐ ", "")),
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
          constructionItems: trimmedData["Hạng mục công trình"].trim(),
          type: trimmedData["Hạng mục"].trim(),
          stage: trimmedData["Cấp"].includes("Cấp") ? trimmedData["Cấp"].replace("Cấp", "").trim() : trimmedData["Cấp"].trim(),
          totalStudents: trimmedData["Số HS"].trim() === "" ? null : Number(trimmedData["Số HS"].trim()),
          totalClassrooms: trimmedData["Số PH"].trim() === "" ? null : Number(trimmedData["Số PH"].trim()),
          totalPublicAffairsRooms: trimmedData["Số CV"].trim() === "" ? null : Number(trimmedData["Số CV"].trim()),
          totalRooms: trimmedData["Số p.ở"].trim() === "" ? null : Number(trimmedData["Số p.ở"].trim()),
          totalKitchens: trimmedData["Số bếp"].trim() === "" ? null : Number(trimmedData["Số bếp"].trim()),
          totalToilets: trimmedData["Số WC"].trim() === "" ? null : Number(trimmedData["Số WC"].trim()),
          start_date: trimmedData["Ngày KC"].trim() === "" ? null : trimmedData["Ngày KC"].trim(),
          end_date: trimmedData["Ngày KT"].trim() === "" ? null : trimmedData["Ngày KT"].trim(),
        },
        progressImagesUrl: projectProgressImagesUrl,
        financialStatementUrl: trimmedData["Link sao kê"].trim() ? trimmedData["Link sao kê"].trim() : "No financial statement url",
      });
    }

    const totalAirtableData = results[requestedYear];
    const collectionName = `du-an-${requestedYear}`;

    console.log("Year: ", requestedYear);
    console.log("Total: ", totalAirtableData.length);

    const report = {
      new: [],
      status: [],
      progress: [],
      finished: [],
    };

    const projectHasEmptyFields = reportIfProjectHasEmptyFields(totalAirtableData);
    if (projectHasEmptyFields) return;

    const promises = totalAirtableData.map(async (airtableData) => {
      const collection = firestore.collection(collectionName);
      const querySnapshot = await collection.where("projectId", "==", airtableData["projectId"]).get();

      const projectName = airtableData.name;
      const projectClassification = getProjectClassification(airtableData.classification);
      const projectStatus = airtableData.status;
      const projectProgress = await getProjectProgress(extractFolderId(airtableData.progressImagesUrl));
      const hoanCanhDescription = await getHoanCanhDescription(extractFolderId(airtableData.progressImagesUrl));
      if (projectProgress === undefined || hoanCanhDescription === undefined) return;
      const projectThumbnail =
        ["Ảnh hoàn thiện", "Ảnh tiến độ", "Ảnh hiện trạng"].map((name) => projectProgress.find((p) => p.name === name && p.images.length > 0)).find((project) => project)?.images[0]?.image ??
        "https://www.contentviewspro.com/wp-content/uploads/2017/07/default_image.png";
      const saoKeDescription = airtableData.financialStatementUrl;

      const project = {
        projectId: airtableData.projectId,
        name: projectName,
        author: "Admin",
        publish_date: firebase.firestore.Timestamp.fromDate(new Date()),
        slug: slugify(projectName, { lower: true, strict: true }),
        thumbnail: projectThumbnail,
        description: null,
        category: collectionName,
        classification: projectClassification,
        status: projectStatus,
        totalFund: airtableData.totalFund,
        location: { ...airtableData.location },
        donors: airtableData.donors, // thieu logo, description. anything else?
        progress: projectProgress,
        content: {
          tabs: [
            {
              name: "Hoàn cảnh",
              description: hoanCanhDescription,
              slide_show: [],
            },
            {
              name: "Nhà hảo tâm",
              description: saoKeDescription,
              slide_show: [],
            },
            {
              name: "Mô hình xây",
              description: null, // Tim trong airtable (Chi Hien)
              slide_show: [],
            },
          ],
        },
        metadata: { ...airtableData.metadata },
      };

      // case 1: new project
      if (querySnapshot.empty) {
        const newId = uuidv4().replace(/-/g, "").substring(0, 20);
        const postDocRef = firestore.collection(collectionName).doc(newId);
        // await Promise.all([
        //   postDocRef.set({ ...project, id: newId }),
        //   upsertDocumentToIndex({ ...project, doc_id: newId, collection_id: collectionName }),
        //   updateClassificationAndCategoryCounts(project.classification, project.category, +1),
        // ]);

        report["new"].push(projectName);
      }
      // case 2: existing project
      else {
        const docId = querySnapshot.docs[0].id;
        const docData = querySnapshot.docs[0].data();
        const oldProjectProgress = docData.progress.find((p) => p.name === "Ảnh tiến độ").images.length;
        const newProjectProgress = project.progress.find((p) => p.name === "Ảnh tiến độ").images.length;
        const oldProjectFinished = docData.progress.find((p) => p.name === "Ảnh hoàn thiện").images.length;
        const newProjectFinished = project.progress.find((p) => p.name === "Ảnh hoàn thiện").images.length;

        if (docData.status !== project.status) {
          const statusUpdate = `${airtableData["projectId"]}: ${docData.status} > ${project.status}`;
          report["status"].push(statusUpdate);
        }

        if (Number(oldProjectProgress) < Number(newProjectProgress)) {
          const progressUpdate = `${airtableData["projectId"]}: thêm ${Number(newProjectProgress)} ảnh`;
          report["progress"].push(progressUpdate);
        }

        if (Number(oldProjectFinished) < Number(newProjectFinished)) {
          const finishedUpdate = `${airtableData["projectId"]}: thêm ${Number(newProjectFinished)} ảnh`;
          report["finished"].push(finishedUpdate);
        }

        // await Promise.all([collection.doc(docId).update({ ...project }), upsertDocumentToIndex({ ...project, doc_id: docId, collection_id: collectionName })]);
      }
    });
    await Promise.all(promises);

    // Append to markdown file
    deleteExistingMarkdownFile();

    appendToMarkdownFile(`## Tạo mới dự án: `);
    report["new"].forEach((projectId) => appendToMarkdownFile(`- ${projectId}`));
    appendToMarkdownFile(`\n`);

    appendToMarkdownFile(`## Cập nhật trạng thái dự án: `);
    report["status"].forEach((status) => appendToMarkdownFile(`- ${status}`));
    appendToMarkdownFile(`\n`);

    appendToMarkdownFile(`## Cập nhật ảnh tiến độ dự án: `);
    report["progress"].forEach((progress) => appendToMarkdownFile(`- ${progress}`));
    appendToMarkdownFile(`\n`);

    appendToMarkdownFile(`## Cập nhật ảnh hoàn thiện dự án: `);
    report["finished"].forEach((finished) => appendToMarkdownFile(`- ${finished}`));
    appendToMarkdownFile(`\n`);

    console.log("Done writing to markdown file");
    process.exit(0);
  } catch (error) {
    console.error(error);
  }
}

// updateDuAnFromAirtableToWeb("2024").catch((e) => console.error(e));

module.exports = { extractFolderId, getProjectClassification, getProjectStatus, reportIfProjectHasEmptyFields, standardizeString };

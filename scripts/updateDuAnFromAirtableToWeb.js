const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const slugify = require("slugify");
const { firestore, firebase } = require("./firebase");
const { getProjectProgress, getHoanCanhDescription } = require("./googledrive");
const { upsertDocumentToIndex } = require("../server/services/redis");
const { updateClassificationAndCategoryCounts } = require("../server/utils");
const { getTrelloCardAttachmentsData } = require("./trello");
const { fetchAirtableRecords } = require("./airtable");

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

function vietnameseProjectStatus(status) {
  switch (status) {
    case "can-quyen-gop":
      return "Cần quyên góp";
    case "dang-xay-dung":
      return "Đang xây dựng";
    case "da-hoan-thanh":
      return "Đã hoàn thành";
    default:
      return status;
  }
}

async function updateDuAnFromAirtableToWeb(requestedYear) {
  // Report issues/bugs
  const noHoanCanhDescription = [];
  const noHoanCanhImages = [];
  const trelloLinkIssues = [];
  const report = {
    new: [],
    status: [],
    progress: [],
    finished: [],
  };

  try {
    const collectionName = `du-an-${requestedYear}`;
    const totalAirtableData = await fetchAirtableRecords(requestedYear);
    if (totalAirtableData.length <= 0) return;

    const promises = totalAirtableData.map(async (airtableData) => {
      const collection = firestore.collection(collectionName);
      const querySnapshot = await collection.where("projectId", "==", airtableData["projectId"]).get();

      const projectName = airtableData.name;
      const projectClassification = getProjectClassification(airtableData.classification);
      const projectStatus = airtableData.status;

      const projectProgressObj = await getProjectProgress(extractFolderId(airtableData.progressImagesUrl));
      if (projectProgressObj === undefined) return;

      const { thumbnailImage: projectThumbnail, progress: projectProgress } = projectProgressObj;
      if (projectProgress.find((p) => p.name === "Ảnh hiện trạng").images.length <= 0) {
        noHoanCanhImages.push(airtableData.projectId);

        // // Get hien trang images from Trello
        // if (!airtableData.trelloCardUrl) {
        //   trelloLinkIssues.push(airtableData.projectId);
        //   return;
        // }
        // const match = airtableData.trelloCardUrl.match(/\/c\/([a-zA-Z0-9]+)/);
        // if (!match || !match[1]) {
        //   trelloLinkIssues.push(airtableData.projectId);
        //   return;
        // }
        // const trelloCardId = match[1];
        // const trelloImages = await getTrelloCardAttachmentsData(trelloCardId);
        // if (trelloImages.length <= 0) {
        //   trelloLinkIssues.push(airtableData.projectId);
        //   return;
        // }
        // projectProgress = projectProgress.map((p) => {
        //   if (p.name === "Ảnh hiện trạng") {
        //     p.images = trelloImages;
        //   }
        //   return p;
        // });
      }

      const hoanCanhDescription = await getHoanCanhDescription(extractFolderId(airtableData.progressImagesUrl));
      if (hoanCanhDescription === undefined) {
        noHoanCanhDescription.push(airtableData.projectId);
        return;
      }

      const project = {
        projectId: airtableData.projectId,
        name: projectName,
        author: "Admin",
        publish_date: firebase.firestore.Timestamp.fromDate(new Date()),
        slug: slugify(projectName, { lower: true, strict: true }),
        thumbnail: projectThumbnail, // TODO: team web fix manually
        description: null, // TODO: team web fix manually
        category: collectionName,
        classification: projectClassification,
        status: projectStatus,
        totalFund: airtableData.totalFund,
        location: airtableData.location,
        donors: airtableData.donors,
        progress: projectProgress,
        metadata: airtableData.metadata,
        content: {
          tabs: [
            {
              name: "Hoàn cảnh",
              description: hoanCanhDescription,
              slide_show: [],
            },
            {
              name: "Nhà hảo tâm",
              description: airtableData.financialStatementUrl,
              slide_show: [],
            },
            {
              name: "Mô hình xây",
              description: airtableData.metadata.constructionItems,
              slide_show: [],
            },
          ],
        },
      };

      // case 1: new project
      if (querySnapshot.empty) {
        const newId = uuidv4().replace(/-/g, "").substring(0, 20);
        const postDocRef = firestore.collection(collectionName).doc(newId);
        await Promise.all([
          postDocRef.set({ ...project, id: newId }),
          upsertDocumentToIndex({ ...project, doc_id: newId, collection_id: collectionName }),
          updateClassificationAndCategoryCounts(project.classification, project.category, +1),
        ]);

        report["new"].push(projectName);
      }
      // case 2: existing project
      else {
        const docId = querySnapshot.docs[0].id;
        const docData = querySnapshot.docs[0].data();
        await Promise.all([collection.doc(docId).update({ ...project }), upsertDocumentToIndex({ ...project, doc_id: docId, collection_id: collectionName })]);

        if (docData.status !== project.status) {
          const statusUpdate = `${projectName}: ${vietnameseProjectStatus(docData.status)} -> ${vietnameseProjectStatus(project.status)}`;
          report["status"].push(statusUpdate);
        }

        // const oldProjectProgress = docData.progress.find((p) => p.name === "Ảnh tiến độ").images.length;
        // const newProjectProgress = project.progress.find((p) => p.name === "Ảnh tiến độ").images.length;
        // const oldProjectFinished = docData.progress.find((p) => p.name === "Ảnh hoàn thiện").images.length;
        // const newProjectFinished = project.progress.find((p) => p.name === "Ảnh hoàn thiện").images.length;

        // if (Number(oldProjectProgress) < Number(newProjectProgress)) {
        //   const progressUpdate = `${projectName}: Drive có ${Number(newProjectProgress)} ảnh - Web có ${Number(oldProjectProgress)} ảnh`;
        //   report["progress"].push(progressUpdate);
        // }

        // if (Number(oldProjectFinished) < Number(newProjectFinished)) {
        //   const finishedUpdate = `${projectName}: Drive có ${Number(newProjectFinished)} ảnh - Web có ${Number(oldProjectFinished)} ảnh`;
        //   report["finished"].push(finishedUpdate);
        // }
      }
    });
    await Promise.all(promises);

    // Report issues/bugs
    if (noHoanCanhDescription.length > 0) console.log(`No khao sat files: ${noHoanCanhDescription.length}`, noHoanCanhDescription);
    if (noHoanCanhImages.length > 0) console.log(`No hoan canh images: ${noHoanCanhImages.length}`, noHoanCanhImages);
    // if (trelloLinkIssues.length > 0) console.log(`No trello links: ${trelloLinkIssues.length}`, trelloLinkIssues);

    // Append to markdown file
    const markdownContent = [
      `## ✅ Tạo mới ${report["new"].length} dự án:`,
      ...report["new"].map((projectId) => `- ${projectId}`),
      ``,
      `## ✅ Cập nhật ${report["status"].length} trạng thái dự án:`,
      ...report["status"].map((status) => `- ${status}`),
      ``,
      // `## Cập nhật ảnh tiến độ dự án:`,
      // ...report["progress"].map((progress) => `- ${progress}`),
      // ``,
      // `## Cập nhật ảnh hoàn thiện dự án:`,
      // ...report["finished"].map((finished) => `- ${finished}`),
      ``,
    ].join("\n");
    deleteExistingMarkdownFile();
    appendToMarkdownFile(markdownContent);

    console.log("----------------------------------------");
    console.log("Done!");
    process.exit(0);
  } catch (error) {
    console.error(error);
  }
}

// updateDuAnFromAirtableToWeb("2024");

module.exports = { extractFolderId, getProjectClassification, deleteExistingMarkdownFile, appendToMarkdownFile };

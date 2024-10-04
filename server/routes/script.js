const express = require("express");
const { v4: uuidv4 } = require("uuid");
const slugify = require("slugify");
const { firestore, firebase } = require("../firebase");
const { fetchAirtableRecords } = require("../services/airtable");
const { getProjectProgress, getHoanCanhDescription } = require("../services/googledrive");
const { upsertDocumentToIndex } = require("../services/redis");
const { updateClassificationAndCategoryCounts, formatDate, extractFolderId, getProjectClassification, vietnameseProjectStatus } = require("../utils/index");

const scriptRouter = express.Router();

// Bao cao tien do Zalo - Web:
// 0. Thống kê số liệu
// 1. Dự án mới khởi công
// 2. Dự án đã khởi công nhưng chưa có tiến độ
// 3. Dự án đang được xây dựng
// 4. Dự án đã hoàn thành

scriptRouter.post("/createProjectProgressReportZalo", async (req, res) => {
  const requestedYears = ["2023", "2024"];
  const orders = {
    0: {
      name: "Thống kê số liệu",
      list: {
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
      },
    },
    1: { name: "Dự án mới khởi công", list: { Trường: [], "Khu Nội Trú": [], "Nhà Hạnh Phúc": [], Cầu: [] } },
    2: { name: "Dự án đã khởi công nhưng chưa có tiến độ", list: { Trường: [], "Khu Nội Trú": [], "Nhà Hạnh Phúc": [], Cầu: [] } },
    3: { name: "Dự án đang được xây dựng", list: { Trường: [], "Khu Nội Trú": [], "Nhà Hạnh Phúc": [], Cầu: [] } },
    4: { name: "Dự án đã hoàn thành", list: { Trường: [], "Khu Nội Trú": [], "Nhà Hạnh Phúc": [], Cầu: [] } },
  };
  let htmlContent = ``;
  let errors = {};

  try {
    for (const requestedYear of requestedYears) {
      const { totalAirtableDataList, totalAirtableErrors } = await fetchAirtableRecords(requestedYear);
      if (totalAirtableDataList.length <= 0) continue;

      errors = totalAirtableErrors;
      orders[0].list[requestedYear].total = totalAirtableDataList.length;

      // Prepare data
      const promises = totalAirtableDataList.map(async (airtableData) => {
        const collectionName = `du-an-${requestedYear}`;
        const collection = firestore.collection(collectionName);
        const querySnapshot = await collection.where("projectId", "==", airtableData["projectId"]).get();

        if (querySnapshot.empty) {
          // 1. Dự án mới khởi công
          if (!orders[1].list[airtableData.classification]) return;
          orders[1].list[airtableData.classification].push({ name: airtableData.name });
          return;
        } else {
          if (airtableData.isInProgress === undefined || airtableData.progressNoteZalo === undefined) return;

          // 2. Dự án đã khởi công nhưng chưa có tiến độ
          if (airtableData.status === "dang-xay-dung" && airtableData.isInProgress === false) {
            if (!orders[2].list[airtableData.classification]) return;
            orders[2].list[airtableData.classification].push({ name: airtableData.name, progressNoteZalo: airtableData.progressNoteZalo });
            orders[0].list[requestedYear].inProgress++;
            return;
          }

          // 3. Dự án đang được xây dựng
          if (airtableData.status === "dang-xay-dung" && airtableData.isInProgress === true) {
            if (!orders[3].list[airtableData.classification]) return;
            orders[3].list[airtableData.classification].push({ name: airtableData.name });
            orders[0].list[requestedYear].inProgress++;
            return;
          }

          // 4. Dự án đã hoàn thành
          const docData = querySnapshot.docs[0].data();
          if (docData.status === "dang-xay-dung" && airtableData.status === "da-hoan-thanh") {
            if (!orders[4].list[airtableData.classification]) return;
            orders[4].list[airtableData.classification].push({ name: airtableData.name });
            return;
          }
        }
      });
      await Promise.all(promises);

      orders[0].list[requestedYear].completed = orders[0].list[requestedYear].total - orders[0].list[requestedYear].inProgress;
    }

    // Generate HTML content
    // 0. Thống kê số liệu
    htmlContent += `<p style="font-size: 1.5rem;"><strong>Thống kê số liệu</strong></p>`;
    htmlContent += `<p style="font-size: 1.2rem;"><strong>Năm 2023</strong></p>`;
    htmlContent += `<ul style="list-style-type: disc; padding-left: 20px;">`;
    htmlContent += `<li>Tổng dự án đã khởi công: <strong>${orders[0].list["2023"].total - 1}</strong></li>`;
    htmlContent += `<li>Tổng dự án đã hoàn thành: <strong>${orders[0].list["2023"].completed}</strong></li>`;
    htmlContent += `<li>Tổng dự án đang được xây: <strong>${orders[0].list["2023"].inProgress}</strong></li>`;
    htmlContent += `</ul>`;
    htmlContent += `<p style="font-size: 1.2rem;"><strong>Năm 2024</strong></p>`;
    htmlContent += `<ul style="list-style-type: disc; padding-left: 20px;">`;
    htmlContent += `<li>Tổng dự án đã khởi công: <strong>${orders[0].list["2024"].total}</strong></li>`;
    htmlContent += `<li>Tổng dự án đã hoàn thành: <strong>${orders[0].list["2024"].completed}</strong></li>`;
    htmlContent += `<li>Tổng dự án đang được xây: <strong>${orders[0].list["2024"].inProgress}</strong></li>`;
    htmlContent += `</ul>`;

    // 1. Dự án mới khởi công
    if (Object.values(orders[1].list).flat().length > 0) {
      const section1 = orders[1];
      htmlContent += `<p style="font-size: 1.5rem;"><strong>${Object.values(section1.list).flat().length} ${section1.name}</strong></p>`;
      for (const [classification, projectList] of Object.entries(section1.list)) {
        if (projectList.length > 0) {
          htmlContent += `<p style="margin-top: revert;"><strong>${classification}</strong></p>`;
          htmlContent += `<ol style="padding-left: 20px;">`;
          for (const project of projectList) {
            htmlContent += `<li>${project.name}</li>`;
          }
          htmlContent += `</ol>`;
        }
      }
    }

    // 2. Dự án đã khởi công nhưng chưa có tiến độ
    if (Object.values(orders[2].list).flat().length > 0) {
      const section2 = orders[2];
      htmlContent += `<p style="font-size: 1.5rem;"><strong>${Object.values(section2.list).flat().length} ${section2.name}</strong></p>`;
      for (const [classification, projectList] of Object.entries(section2.list)) {
        if (projectList.length > 0) {
          htmlContent += `<p style="margin-top: revert;"><strong>${classification}</strong></p>`;
          htmlContent += `<ol style="padding-left: 20px;">`;
          for (const project of projectList) {
            htmlContent += `<li>${project.name} => ${project.progressNoteZalo}</li>`;
          }
          htmlContent += `</ol>`;
        }
      }
    }

    // 3. Dự án đang được xây dựng
    if (Object.values(orders[3].list).flat().length > 0) {
      const section3 = orders[3];
      htmlContent += `<p style="font-size: 1.5rem;"><strong>${Object.values(section3.list).flat().length} ${section3.name}</strong></p>`;
      for (const [classification, projectList] of Object.entries(section3.list)) {
        if (projectList.length > 0) {
          htmlContent += `<p style="margin-top: revert;"><strong>${classification}</strong></p>`;
          htmlContent += `<ol style="padding-left: 20px;">`;
          for (const project of projectList) {
            htmlContent += `<li>${project.name}</li>`;
          }
          htmlContent += `</ol>`;
        }
      }
    }

    // 4. Dự án đã hoàn thành
    if (Object.values(orders[4].list).flat().length > 0) {
      const section4 = orders[4];
      htmlContent += `<p style="font-size: 1.5rem;"><strong>${Object.values(section4.list).flat().length} ${section4.name}</strong></p>`;
      for (const [classification, projectList] of Object.entries(section4.list)) {
        if (projectList.length > 0) {
          htmlContent += `<p style="margin-top: revert;"><strong>${classification}</strong></p>`;
          htmlContent += `<ol style="padding-left: 20px;">`;
          for (const project of projectList) {
            htmlContent += `<li>${project.name}</li>`;
          }
          htmlContent += `</ol>`;
        }
      }
    }

    // Create a News Post
    const news = {
      name: `Báo cáo tiến độ group Zalo`,
      content: htmlContent,
      errors: errors,
    };

    res.status(200).send(news);
  } catch (error) {
    console.error("[createProjectProgressReportZalo]: ", error.message);
    res.status(500).send("[createProjectProgressReportZalo]: ", error.message);
  }
});

scriptRouter.post("/createProjectProgressReportWeb", async (req, res) => {
  const requestedYears = ["2023", "2024"];
  const orders = {
    0: {
      name: "Thống kê số liệu",
      list: {
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
      },
    },
    1: { name: "Dự án mới khởi công", list: { Trường: [], "Khu Nội Trú": [], "Nhà Hạnh Phúc": [], Cầu: [] } },
    2: { name: "Dự án đã khởi công nhưng chưa có tiến độ", list: { Trường: [], "Khu Nội Trú": [], "Nhà Hạnh Phúc": [], Cầu: [] } },
    3: { name: "Dự án đang được xây dựng", list: { Trường: [], "Khu Nội Trú": [], "Nhà Hạnh Phúc": [], Cầu: [] } },
  };
  let htmlContent = ``;
  const slideshowImages = [];

  try {
    for (const requestedYear of requestedYears) {
      const { totalAirtableDataList } = await fetchAirtableRecords(requestedYear);
      if (totalAirtableDataList.length <= 0) continue;

      orders[0].list[requestedYear].total = totalAirtableDataList.length;

      // Prepare data
      const promises = totalAirtableDataList.map(async (airtableData) => {
        const collectionName = `du-an-${requestedYear}`;
        const collection = firestore.collection(collectionName);
        const querySnapshot = await collection.where("projectId", "==", airtableData["projectId"]).get();

        if (querySnapshot.empty) {
          // 1. Dự án mới khởi công
          if (!orders[1].list[airtableData.classification]) return;
          orders[1].list[airtableData.classification].push({ name: airtableData.name });
          return;
        } else {
          if (airtableData.isInProgress === undefined || airtableData.progressNoteWeb === undefined) return;

          // 2. Dự án đã khởi công nhưng chưa có tiến độ
          if (airtableData.status === "dang-xay-dung" && airtableData.isInProgress === false) {
            if (!orders[2].list[airtableData.classification]) return;
            orders[2].list[airtableData.classification].push({ name: airtableData.name, progressNoteWeb: airtableData.progressNoteWeb });
            orders[0].list[requestedYear].inProgress++;
            return;
          }

          // 3. Dự án đang được xây dựng
          if (airtableData.status === "dang-xay-dung" && airtableData.isInProgress === true) {
            const projectProgressObj = await getProjectProgress(extractFolderId(airtableData.progressImagesUrl));
            if (projectProgressObj === undefined) return;
            const { thumbnailImage: projectThumbnail, progress: projectProgress } = projectProgressObj;
            if (!orders[3].list[airtableData.classification]) return;
            orders[3].list[airtableData.classification].push({ name: airtableData.name, projectThumbnail: projectThumbnail });
            orders[0].list[requestedYear].inProgress++;
            return;
          }
        }
      });
      await Promise.all(promises);

      orders[0].list[requestedYear].completed = orders[0].list[requestedYear].total - orders[0].list[requestedYear].inProgress;
    }

    // Generate HTML content
    // 0. Thống kê số liệu
    htmlContent += `<p style="font-size: 1.5rem;"><strong>Thống kê số liệu</strong></p>`;
    htmlContent += `<p style="font-size: 1.2rem;"><strong>Năm 2023</strong></p>`;
    htmlContent += `<ul style="list-style-type: disc; padding-left: 20px;">`;
    htmlContent += `<li>Tổng dự án đã khởi công: <strong>${orders[0].list["2023"].total - 1}</strong></li>`;
    htmlContent += `<li>Tổng dự án đã hoàn thành: <strong>${orders[0].list["2023"].completed}</strong></li>`;
    htmlContent += `<li>Tổng dự án đang được xây: <strong>${orders[0].list["2023"].inProgress}</strong></li>`;
    htmlContent += `</ul>`;
    htmlContent += `<p style="font-size: 1.2rem;"><strong>Năm 2024</strong></p>`;
    htmlContent += `<ul style="list-style-type: disc; padding-left: 20px;">`;
    htmlContent += `<li>Tổng dự án đã khởi công: <strong>${orders[0].list["2024"].total}</strong></li>`;
    htmlContent += `<li>Tổng dự án đã hoàn thành: <strong>${orders[0].list["2024"].completed}</strong></li>`;
    htmlContent += `<li>Tổng dự án đang được xây: <strong>${orders[0].list["2024"].inProgress}</strong></li>`;
    htmlContent += `</ul>`;

    // 1. Dự án mới khởi công
    if (Object.values(orders[1].list).flat().length > 0) {
      const section1 = orders[1];
      htmlContent += `<p style="font-size: 1.5rem;"><strong>${Object.values(section1.list).flat().length} ${section1.name}</strong></p>`;
      for (const [classification, projectList] of Object.entries(section1.list)) {
        if (projectList.length > 0) {
          htmlContent += `<p style="margin-top: revert;"><strong>${classification}</strong></p>`;
          htmlContent += `<ol style="padding-left: 20px;">`;
          for (const project of projectList) {
            htmlContent += `<li>${project.name}</li>`;
          }
          htmlContent += `</ol>`;
        }
      }
    }

    // 2. Dự án đã khởi công nhưng chưa có tiến độ
    if (Object.values(orders[2].list).flat().length > 0) {
      const section2 = orders[2];
      htmlContent += `<p style="font-size: 1.5rem;"><strong>${Object.values(section2.list).flat().length} ${section2.name}</strong></p>`;
      for (const [classification, projectList] of Object.entries(section2.list)) {
        if (projectList.length > 0) {
          htmlContent += `<p style="margin-top: revert;"><strong>${classification}</strong></p>`;
          htmlContent += `<ol style="padding-left: 20px;">`;
          for (const project of projectList) {
            htmlContent += `<li>${project.name} => ${project.progressNoteWeb}</li>`;
          }
          htmlContent += `</ol>`;
        }
      }
    }

    // 3. Dự án đang được xây dựng
    if (Object.values(orders[3].list).flat().length > 0) {
      const section3 = orders[3];
      htmlContent += `<p style="font-size: 1.5rem;"><strong>${Object.values(section3.list).flat().length} ${section3.name}</strong></p>`;
      for (const [classification, projectList] of Object.entries(section3.list)) {
        if (projectList.length > 0) {
          htmlContent += `<p style="margin-top: revert;"><strong>${classification}</strong></p>`;
          htmlContent += `<ol style="padding-left: 20px;">`;
          for (const project of projectList) {
            htmlContent += `<li>${project.name}</li>`;
            slideshowImages.push({
              image: project.projectThumbnail,
              caption: project.name,
            });
          }
          htmlContent += `</ol>`;
        }
      }
      htmlContent += `<p style="font-style: italic; text-align: center;"><strong>(Chi tiết xem từng ảnh phía dưới)</strong></p>`;
    }

    // Create a News Post
    const today = new Date();
    const last7Days = new Date(today);
    last7Days.setDate(today.getDate() - 6);
    const newId = uuidv4().replace(/-/g, "").substring(0, 20);
    const title = `Dự án Sức mạnh 2000 cập nhật tiến độ các dự án trong tuần từ ngày ${formatDate(last7Days)} đến ngày ${formatDate(today)}`;
    const category = "thong-bao";
    const news = {
      id: newId,
      name: title,
      author: "Admin",
      publish_date: firebase.firestore.Timestamp.fromDate(new Date()),
      slug: slugify(formatDate(today), { lower: true, strict: true }),
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

    await Promise.all([
      firestore.collection(category).doc(newId).set(news),
      upsertDocumentToIndex({ ...news, collection_id: category, doc_id: newId }),
      updateClassificationAndCategoryCounts(news.classification, news.category, +1),
    ]);
    res.status(200).send({});
  } catch (error) {
    console.error("[createProjectProgressReportWeb]: ", error.message);
    res.status(500).send("[createProjectProgressReportWeb]: ", error.message);
  }
});

// Bao cao up Web:
// 1. Dự án mới
// 2. Dự án đổi trạng thái

scriptRouter.post("/createWebUpdateReport", async (req, res) => {
  const requestedYears = ["2024"];
  const orders = {
    1: { name: "Dự án mới", list: [] },
    2: { name: "Dự án đổi trạng thái", list: [] },
  };
  let htmlContent = ``;
  let errors = {
    "DA không có phiếu khảo sát": [],
    "DA không có ảnh hiện trạng": [],
  };

  try {
    for (const requestedYear of requestedYears) {
      const { totalAirtableDataList, totalAirtableErrors } = await fetchAirtableRecords(requestedYear);
      if (totalAirtableDataList.length <= 0) continue;

      errors = { ...errors, ...totalAirtableErrors };

      // Prepare data
      const promises = totalAirtableDataList.map(async (airtableData) => {
        const collectionName = `du-an-${requestedYear}`;
        const collection = firestore.collection(collectionName);
        const querySnapshot = await collection.where("projectId", "==", airtableData["projectId"]).get();

        const projectProgressObj = await getProjectProgress(extractFolderId(airtableData.progressImagesUrl));
        if (projectProgressObj === undefined) return;

        const { thumbnailImage: projectThumbnail, progress: projectProgress } = projectProgressObj;
        if (projectProgress.find((p) => p.name === "Ảnh hiện trạng").images.length <= 0) {
          errors["No anh hien trang"].push(airtableData.name);
          return;
        }

        const hoanCanhDescription = await getHoanCanhDescription(extractFolderId(airtableData.progressImagesUrl));
        if (hoanCanhDescription === undefined) {
          errors["No phieu khao sat"].push(airtableData.name);
          return;
        }

        // 1. Dự án mới
        if (querySnapshot.empty) {
          orders[1].list.push(airtableData.name);
          return;
        }
        // 2. Dự án đổi trạng thái
        else {
          const docData = querySnapshot.docs[0].data();
          if (docData.status !== airtableData.status) {
            const statusUpdate = `${airtableData.name}: ${vietnameseProjectStatus(docData.status)} -> ${vietnameseProjectStatus(airtableData.status)}`;
            orders[2].list.push(statusUpdate);
            return;
          }
        }
      });
      await Promise.all(promises);
    }

    // Generate HTML content
    // 1. Dự án mới
    if (orders[1].list.length > 0) {
      htmlContent += `<p style="font-size: 1.2rem;"><strong>✅ Tạo mới ${orders[1].list.length} dự án</strong></p>`;
      htmlContent += `<ol style="padding-left: 20px;">`;
      for (const project of orders[1].list) {
        htmlContent += `<li>${project}</li>`;
      }
      htmlContent += `</ol>`;
    } else {
      htmlContent += `<p style="font-size: 1.2rem;"><strong>Hiện tại không có dự án mới nào</strong></p>`;
    }

    // 2. Dự án đổi trạng thái
    if (orders[2].list.length > 0) {
      htmlContent += `<p style="font-size: 1.2rem;"><strong>✅ Cập nhật ${orders[2].list.length} trạng thái dự án</strong></p>`;
      htmlContent += `<ol style="padding-left: 20px;">`;
      for (const project of orders[2].list) {
        htmlContent += `<li>${project}</li>`;
      }
      htmlContent += `</ol>`;
    } else {
      htmlContent += `<p style="font-size: 1.2rem;"><strong>Hiện tại không có dự án nào đổi trạng thái</strong></p>`;
    }

    // Create report
    const report = {
      name: `Báo cáo up Web`,
      content: htmlContent,
      errors: errors,
    };

    res.status(200).send(report);
  } catch (error) {
    console.error("[createWebUpdateReport]: ", error.message);
    res.status(500).send("[createWebUpdateReport]: ", error.message);
  }
});

scriptRouter.post("/syncAirtableAndWeb", async (req, res) => {
  const requestedYears = ["2024"];

  try {
    for (const requestedYear of requestedYears) {
      const { totalAirtableDataList } = await fetchAirtableRecords(requestedYear);
      if (totalAirtableDataList.length <= 0) continue;

      // Prepare data
      const promises = totalAirtableDataList.map(async (airtableData) => {
        const collectionName = `du-an-${requestedYear}`;
        const collection = firestore.collection(collectionName);
        const querySnapshot = await collection.where("projectId", "==", airtableData["projectId"]).get();

        const projectProgressObj = await getProjectProgress(extractFolderId(airtableData.progressImagesUrl));
        if (projectProgressObj === undefined) return;

        const { thumbnailImage: projectThumbnail, progress: projectProgress } = projectProgressObj;
        if (projectProgress.find((p) => p.name === "Ảnh hiện trạng").images.length <= 0) return;

        const hoanCanhDescription = await getHoanCanhDescription(extractFolderId(airtableData.progressImagesUrl));
        if (hoanCanhDescription === undefined) return;

        const project = {
          projectId: airtableData.projectId,
          name: airtableData.name,
          author: "Admin",
          publish_date: firebase.firestore.Timestamp.fromDate(new Date()),
          slug: slugify(airtableData.projectId, { lower: true, strict: true }),
          thumbnail: projectThumbnail,
          description: null, // TODO: team web fix manually - hien tai chua co
          category: collectionName,
          classification: getProjectClassification(airtableData.classification),
          status: airtableData.status,
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

        // 1. Dự án mới
        if (querySnapshot.empty) {
          const newId = uuidv4().replace(/-/g, "").substring(0, 20);
          const postDocRef = firestore.collection(collectionName).doc(newId);
          return await Promise.all([
            postDocRef.set({ ...project, id: newId }),
            upsertDocumentToIndex({ ...project, doc_id: newId, collection_id: collectionName }),
            updateClassificationAndCategoryCounts(project.classification, project.category, +1),
          ]);
        }
        // 2. Dự án đổi trạng thái
        else {
          const docId = querySnapshot.docs[0].id;
          return await Promise.all([collection.doc(docId).update({ ...project }), upsertDocumentToIndex({ ...project, doc_id: docId, collection_id: collectionName })]);
        }
      });
      await Promise.all(promises);
    }

    res.status(200).send({});
  } catch (error) {
    console.error("[syncAirtableAndWeb]: ", error.message);
    res.status(500).send("[syncAirtableAndWeb]: ", error.message);
  }
});

module.exports = scriptRouter;

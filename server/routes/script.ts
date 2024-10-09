import express from "express";
import { Request, Response } from "express";
import { NewsPost, ProjectPost } from "../../index";
import { v4 as uuidv4 } from "uuid";
import slugify from "slugify";
import { firestore, firebase } from "../firebase";
import { fetchAirtableRecords } from "../services/airtable";
import { getProjectProgress, getHoanCanhDescription } from "../services/googledrive";
import { upsertDocumentToIndex } from "../services/redis";
import { updateClassificationAndCategoryCounts, formatDate, extractFolderId, getProjectClassification, vietnameseProjectStatus } from "../utils/index";

const scriptRouter = express.Router();

// Báo cáo tiến độ
// 0. Thống kê số liệu
// 1. Dự án mới khởi công
// 2. Dự án đã khởi công nhưng chưa có tiến độ
// 3. Dự án đang được xây dựng
// 4. Dự án đã hoàn thành

scriptRouter.post("/findAirtableErrors", async (req: Request, res: Response) => {
  const requestedYears = ["2023", "2024"];
  let errors: any = {
    "DA sai link GD": [],
    "DA không có phiếu khảo sát": [],
    "DA không có ảnh hiện trạng": [],
    Khác: {},
  };
  const BATCH_SIZE = 25;

  try {
    for (const requestedYear of requestedYears) {
      const { totalAirtableDataList, totalAirtableErrors }: any = await fetchAirtableRecords(requestedYear);
      if (totalAirtableDataList.length <= 0) continue;

      if (requestedYear === "2024") {
        errors = { ...totalAirtableErrors, ...errors };
      }

      for (let i = 0; i < totalAirtableDataList.length; i += BATCH_SIZE) {
        const batch = totalAirtableDataList.slice(i, i + BATCH_SIZE);

        const promises = batch.map(async (airtableData: any) => {
          const collectionName = `du-an-${requestedYear}`;
          const collection = firestore.collection(collectionName);
          const querySnapshot = await collection.where("projectId", "==", airtableData["projectId"]).get();

          const projectProgressObj = await getProjectProgress(extractFolderId(airtableData.progressImagesUrl));
          if (projectProgressObj === undefined) {
            requestedYear === "2024" && errors["DA sai link GD"].push(airtableData?.name ?? airtableData?.projectId);
            return;
          }

          const { progress: projectProgress }: any = projectProgressObj;
          if (projectProgress.find((p: any) => p?.name === "Ảnh hiện trạng")?.images?.length <= 0) {
            requestedYear === "2024" && errors["DA không có ảnh hiện trạng"].push(airtableData?.name ?? airtableData?.projectId);
          }

          let hoanCanhDescription = await getHoanCanhDescription(extractFolderId(airtableData.progressImagesUrl));
          if (hoanCanhDescription === undefined) {
            requestedYear === "2024" && errors["DA không có phiếu khảo sát"].push(airtableData?.name ?? airtableData?.projectId);
          }

          if (!querySnapshot.empty && requestedYear === "2024") {
            const docData = querySnapshot.docs[0].data();
            if (airtableData.isInProgress === undefined || airtableData.progressNoteZalo === undefined) return;

            const attributesToCompare = [
              "projectId",
              "name",
              "classification",
              "totalFund",
              "location.province",
              "location.district",
              "location.commune",
              "metadata.constructionItems",
              "metadata.type",
              "metadata.stage",
              "metadata.totalStudents",
              "metadata.totalClassrooms",
              "metadata.totalRooms",
              "metadata.totalPublicAffairsRooms",
              "metadata.totalKitchens",
              "metadata.totalToilets",
              "metadata.start_date",
              "metadata.end_date",
            ];

            const classificationMapping: any = {
              "truong-hoc": "Trường học",
              "nha-hanh-phuc": "Nhà hạnh phúc",
              "khu-noi-tru": "Khu nội trú",
              "cau-hanh-phuc": "Cầu hạnh phúc",
              wc: "WC",
              "loai-khac": "Loại khác",
              "phong-tin-hoc": "Phòng tin học",
            };

            attributesToCompare.map((key) => {
              if (key === "classification") {
                const airClassification = getProjectClassification(airtableData[key]);
                if (airClassification !== docData[key]) {
                  if (!errors["Khác"][key]) {
                    errors["Khác"][key] = [];
                  }
                  errors["Khác"][key].push(
                    `<p><strong>${airtableData.name}:</strong></p> <p><strong> - Web:</strong> ${classificationMapping[docData[key]]}</p> <p><strong> - Air:</strong> ${classificationMapping[airClassification]}</p>`
                  );
                }
              } else {
                if (airtableData[key] !== docData[key]) {
                  if (!errors["Khác"][key]) {
                    errors["Khác"][key] = [];
                  }
                  errors["Khác"][key].push(`<p><strong>${airtableData.name}:</strong></p> <p><strong> - Web:</strong> ${docData[key]}</p> <p><strong> - Air:</strong> ${airtableData[key]}`);
                }
              }
            });
          }
        });
        await Promise.all(promises);
      }
    }

    // Create report
    const report = {
      name: `Báo cáo lỗi Airtable`,
      errors: errors,
    };

    res.header("Access-Control-Allow-Origin", "*");
    res.status(200).send(report);
  } catch (error: any) {
    console.error("[findAirtableErrors]: ", error.message);
    res.status(500).send(`[findAirtableErrors]: ${error.message}`);
  }
});

scriptRouter.post("/createProjectProgressReportZalo", async (req: Request, res: Response) => {
  const requestedYears = ["2023", "2024"];
  const orders: any = {
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
  const BATCH_SIZE = 25;

  try {
    for (const requestedYear of requestedYears) {
      const { totalAirtableDataList }: any = await fetchAirtableRecords(requestedYear);
      if (totalAirtableDataList.length <= 0) continue;

      orders[0].list[requestedYear].total = totalAirtableDataList.length;

      for (let i = 0; i < totalAirtableDataList.length; i += BATCH_SIZE) {
        const batch = totalAirtableDataList.slice(i, i + BATCH_SIZE);

        const promises = batch.map(async (airtableData: any) => {
          const collectionName = `du-an-${requestedYear}`;
          const collection = firestore.collection(collectionName);
          const querySnapshot = await collection.where("projectId", "==", airtableData["projectId"]).get();

          if (!querySnapshot.empty) {
            const docData = querySnapshot.docs[0].data();

            // 1. Dự án mới khởi công
            if (docData.status === "can-quyen-gop" && airtableData.status === "dang-xay-dung") {
              if (!orders[1].list[airtableData.classification]) return;
              orders[1].list[airtableData.classification].push({ name: airtableData.name });
              return;
            }

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
            if (docData.status === "dang-xay-dung" && airtableData.status === "da-hoan-thanh") {
              if (!orders[4].list[airtableData.classification]) return;
              orders[4].list[airtableData.classification].push({ name: airtableData.name });
              return;
            }
          }
        });

        await Promise.all(promises);
      }

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
    const section1 = orders[1];
    htmlContent += `<p style="font-size: 1.5rem;"><strong>${(Object.values(section1.list) as any).flat().length} ${section1.name}</strong></p>`;
    for (const [classification, projectList] of Object.entries(section1.list) as any) {
      if (projectList.length > 0) {
        htmlContent += `<p style="margin-top: revert;"><strong>${classification}</strong></p>`;
        htmlContent += `<ol style="padding-left: 20px;">`;
        for (const project of projectList) {
          htmlContent += `<li>${project.name}</li>`;
        }
        htmlContent += `</ol>`;
      }
    }

    // 2. Dự án đã khởi công nhưng chưa có tiến độ
    const section2 = orders[2];
    htmlContent += `<p style="font-size: 1.5rem;"><strong>${(Object.values(section2.list) as any).flat().length} ${section2.name}</strong></p>`;
    for (const [classification, projectList] of Object.entries(section2.list) as any) {
      if (projectList.length > 0) {
        htmlContent += `<p style="margin-top: revert;"><strong>${classification}</strong></p>`;
        htmlContent += `<ol style="padding-left: 20px;">`;
        for (const project of projectList) {
          htmlContent += `<li>${project.name} => ${project.progressNoteZalo}</li>`;
        }
        htmlContent += `</ol>`;
      }
    }

    // 3. Dự án đang được xây dựng
    const section3 = orders[3];
    htmlContent += `<p style="font-size: 1.5rem;"><strong>${(Object.values(section3.list) as any).flat().length} ${section3.name}</strong></p>`;
    for (const [classification, projectList] of Object.entries(section3.list) as any) {
      if (projectList.length > 0) {
        htmlContent += `<p style="margin-top: revert;"><strong>${classification}</strong></p>`;
        htmlContent += `<ol style="padding-left: 20px;">`;
        for (const project of projectList) {
          htmlContent += `<li>${project.name}</li>`;
        }
        htmlContent += `</ol>`;
      }
    }

    // 4. Dự án đã hoàn thành
    const section4 = orders[4];
    htmlContent += `<p style="font-size: 1.5rem;"><strong>${(Object.values(section4.list) as any).flat().length} ${section4.name}</strong></p>`;
    for (const [classification, projectList] of Object.entries(section4.list) as any) {
      if (projectList.length > 0) {
        htmlContent += `<p style="margin-top: revert;"><strong>${classification}</strong></p>`;
        htmlContent += `<ol style="padding-left: 20px;">`;
        for (const project of projectList) {
          htmlContent += `<li>${project.name}</li>`;
        }
        htmlContent += `</ol>`;
      }
    }

    // Create report
    const report = {
      name: `Báo cáo tiến độ group Zalo`,
      content: htmlContent,
    };

    res.header("Access-Control-Allow-Origin", "*");
    res.status(200).send(report);
  } catch (error: any) {
    console.error("[createProjectProgressReportZalo]: ", error.message);
    res.status(500).send(`[createProjectProgressReportZalo]: ${error.message}`);
  }
});

scriptRouter.post("/createProjectProgressReportWeb", async (req: Request, res: Response) => {
  const requestedYears = ["2023", "2024"];
  const orders: any = {
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
  const slideshowImages: { image: string; caption: string }[] = [];
  const BATCH_SIZE = 25;

  try {
    for (const requestedYear of requestedYears) {
      const { totalAirtableDataList }: any = await fetchAirtableRecords(requestedYear);
      if (totalAirtableDataList.length <= 0) continue;

      orders[0].list[requestedYear].total = totalAirtableDataList.length;

      for (let i = 0; i < totalAirtableDataList.length; i += BATCH_SIZE) {
        const batch = totalAirtableDataList.slice(i, i + BATCH_SIZE);

        const promises = batch.map(async (airtableData: any) => {
          const collectionName = `du-an-${requestedYear}`;
          const collection = firestore.collection(collectionName);
          const querySnapshot = await collection.where("projectId", "==", airtableData["projectId"]).get();

          const projectProgressObj = await getProjectProgress(extractFolderId(airtableData.progressImagesUrl));
          if (projectProgressObj === undefined) return;
          const { thumbnailImage: projectThumbnail } = projectProgressObj;

          if (!querySnapshot.empty) {
            const docData = querySnapshot.docs[0].data();

            // 1. Dự án mới khởi công
            if (docData.status === "can-quyen-gop" && airtableData.status === "dang-xay-dung") {
              if (!orders[1].list[airtableData.classification]) return;
              orders[1].list[airtableData.classification].push({ name: airtableData.name });
              return;
            }

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
              if (!orders[3].list[airtableData.classification]) return;
              orders[3].list[airtableData.classification].push({ name: airtableData.name, projectThumbnail: projectThumbnail });
              orders[0].list[requestedYear].inProgress++;
              slideshowImages.push({ caption: airtableData.name, image: projectThumbnail });
              return;
            }
          }
        });

        await Promise.all(promises);
      }

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
    const section1 = orders[1];
    htmlContent += `<p style="font-size: 1.5rem;"><strong>${(Object.values(section1.list) as any).flat().length} ${section1.name}</strong></p>`;
    for (const [classification, projectList] of Object.entries(section1.list) as any) {
      if (projectList.length > 0) {
        htmlContent += `<p style="margin-top: revert;"><strong>${classification}</strong></p>`;
        htmlContent += `<ol style="padding-left: 20px;">`;
        for (const project of projectList) {
          htmlContent += `<li>${project.name}</li>`;
        }
        htmlContent += `</ol>`;
      }
    }

    // 2. Dự án đã khởi công nhưng chưa có tiến độ
    const section2 = orders[2];
    htmlContent += `<p style="font-size: 1.5rem;"><strong>${(Object.values(section2.list) as any).flat().length} ${section2.name}</strong></p>`;
    for (const [classification, projectList] of Object.entries(section2.list) as any) {
      if (projectList.length > 0) {
        htmlContent += `<p style="margin-top: revert;"><strong>${classification}</strong></p>`;
        htmlContent += `<ol style="padding-left: 20px;">`;
        for (const project of projectList) {
          htmlContent += `<li>${project.name} => ${project.progressNoteWeb}</li>`;
        }
        htmlContent += `</ol>`;
      }
    }

    // 3. Dự án đang được xây dựng
    const section3 = orders[3];
    htmlContent += `<p style="font-size: 1.5rem;"><strong>${(Object.values(section3.list) as any).flat().length} ${section3.name}</strong></p>`;
    for (const [classification, projectList] of Object.entries(section3.list) as any) {
      if (projectList.length > 0) {
        htmlContent += `<p style="margin-top: revert;"><strong>${classification}</strong></p>`;
        htmlContent += `<ol style="padding-left: 20px;">`;
        for (const project of projectList) {
          htmlContent += `<li>${project.name}</li>`;
        }
        htmlContent += `</ol>`;
      }
    }
    htmlContent += `<p style="font-style: italic; text-align: center;"><strong>(Xem ảnh chi tiết phía dưới)</strong></p>`;

    // Create a News Post
    const today = new Date();
    const last7Days = new Date(today);
    last7Days.setDate(today.getDate() - 6);
    const newId = uuidv4().replace(/-/g, "").substring(0, 20);
    const title = `Dự án Sức mạnh 2000 cập nhật tiến độ các dự án trong tuần từ ngày ${formatDate(last7Days)} đến ngày ${formatDate(today)}`;
    const category = "thong-bao";
    const newsPost: NewsPost = {
      id: newId,
      name: title,
      author: "Admin",
      slug: slugify(formatDate(today), { lower: true, strict: true }),
      createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
      updatedAt: firebase.firestore.Timestamp.fromDate(new Date()),
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
      firestore.collection(category).doc(newId).set(newsPost),
      upsertDocumentToIndex({ ...newsPost, collection_id: category, doc_id: newId }),
      updateClassificationAndCategoryCounts(undefined, newsPost.category, +1),
    ]);

    res.header("Access-Control-Allow-Origin", "*");
    res.status(200).send({});
  } catch (error: any) {
    console.error("[createProjectProgressReportWeb]: ", error.message);
    res.status(500).send(`[createProjectProgressReportWeb]: ${error.message}`);
  }
});

// BÁo cáo up web
// 1. Dự án mới
// 2. Dự án thay đổi trạng thái
// 3. Dự án cập nhật thêm ảnh
// 4. Dự án cập nhật ảnh đại diện
// 5. Dự án cập nhật phiếu khảo sát

scriptRouter.post("/createWebUpdateReport", async (req: Request, res: Response) => {
  const requestedYears = ["2024"];
  const orders: any = {
    1: { name: "Dự án mới", list: [] },
    2: { name: "Dự án thay đổi trạng thái", list: [] },
    3: { name: "Dự án cập nhật thêm ảnh", list: [] },
    4: { name: "Dự án cập nhật ảnh đại diện", list: [] },
    5: { name: "Dự án cập nhật phiếu khảo sát", list: [] },
  };
  let htmlContent = ``;
  const BATCH_SIZE = 25;

  try {
    for (const requestedYear of requestedYears) {
      const { totalAirtableDataList }: any = await fetchAirtableRecords(requestedYear);
      if (totalAirtableDataList.length <= 0) continue;

      // Process data in batches
      for (let i = 0; i < totalAirtableDataList.length; i += BATCH_SIZE) {
        const batch = totalAirtableDataList.slice(i, i + BATCH_SIZE);

        const promises = batch.map(async (airtableData: any) => {
          const collectionName = `du-an-${requestedYear}`;
          const collection = firestore.collection(collectionName);
          const querySnapshot = await collection.where("projectId", "==", airtableData["projectId"]).get();

          const projectProgressObj = await getProjectProgress(extractFolderId(airtableData.progressImagesUrl));
          if (projectProgressObj === undefined) return;
          const { thumbnailImage: projectThumbnail, progress: airtableProjectProgress } = projectProgressObj;

          let hoanCanhDescription = await getHoanCanhDescription(extractFolderId(airtableData.progressImagesUrl));
          if (hoanCanhDescription === undefined) {
            hoanCanhDescription = "";
          }

          // 1. Dự án mới
          if (querySnapshot.empty) {
            orders[1].list.push(airtableData.name);
          } else {
            const docData = querySnapshot.docs[0].data();

            // 2. Dự án thay đổi trạng thái
            if (docData.status !== airtableData.status) {
              const statusUpdate = `${airtableData.name}: ${vietnameseProjectStatus(docData.status)} -> ${vietnameseProjectStatus(airtableData.status)}`;
              orders[2].list.push(statusUpdate);
            }

            // 3. Dự án cập nhật thêm ảnh
            const webProjectProgress = docData.progressNew ?? docData.progress;
            airtableProjectProgress.map((airSection) => {
              const webSection = webProjectProgress.find((s: any) => s.name === airSection.name);
              if (airSection.images.length > webSection.images.length) {
                const imagesUpdate = `${airtableData.name} (${airSection.name}): Web ${webSection.images.length} <> Air ${airSection.images.length}`;
                orders[3].list.push(imagesUpdate);
              }
            });

            // 4. Dự án cập nhật ảnh đại diện
            if (docData.thumbnail === "" && projectThumbnail !== "") {
              orders[4].list.push(airtableData.name);
            }

            // 5. Dự án cập nhật phiếu khảo sát
            const webProjectContent = docData.contentNew ?? docData.content;
            const webHoanCanhDescription = webProjectContent.tabs.find((t: any) => t.name === "Hoàn cảnh").description;
            if (webHoanCanhDescription === "" && hoanCanhDescription !== "") {
              orders[5].list.push(airtableData.name);
            }
          }
        });

        await Promise.all(promises);
      }
    }

    // Generate HTML content
    // 1. Dự án mới
    htmlContent += `<p style="font-size: 1.2rem;"><strong>${orders[1].list.length} Dự án mới</strong></p>`;
    if (orders[1].list.length > 0) {
      htmlContent += `<ol style="padding-left: 20px;">`;
      for (const project of orders[1].list) {
        htmlContent += `<li>${project}</li>`;
      }
      htmlContent += `</ol>`;
    }

    // 2. Dự án thay đổi trạng thái
    htmlContent += `<p style="font-size: 1.2rem;"><strong>${orders[2].list.length} Dự án thay đổi trạng thái</strong></p>`;
    if (orders[2].list.length > 0) {
      htmlContent += `<ol style="padding-left: 20px;">`;
      for (const project of orders[2].list) {
        htmlContent += `<li>${project}</li>`;
      }
      htmlContent += `</ol>`;
    }

    // 3. Dự án cập nhật thêm ảnh
    htmlContent += `<p style="font-size: 1.2rem;"><strong>${orders[3].list.length} Dự án cập nhật thêm ảnh</strong></p>`;
    if (orders[3].list.length > 0) {
      htmlContent += `<ol style="padding-left: 20px;">`;
      for (const project of orders[3].list) {
        htmlContent += `<li>${project}</li>`;
      }
      htmlContent += `</ol>`;
    }

    // 4.Dự án cập nhật ảnh đại diện
    htmlContent += `<p style="font-size: 1.2rem;"><strong>${orders[4].list.length} Dự án cập nhật ảnh đại diện</strong></p>`;
    if (orders[4].list.length > 0) {
      htmlContent += `<ol style="padding-left: 20px;">`;
      for (const project of orders[4].list) {
        htmlContent += `<li>${project}</li>`;
      }
      htmlContent += `</ol>`;
    }

    // 5. Dự án cập nhật phiếu khảo sát
    htmlContent += `<p style="font-size: 1.2rem;"><strong>${orders[5].list.length} Dự án cập nhật phiếu khảo sát</strong></p>`;
    if (orders[5].list.length > 0) {
      htmlContent += `<ol style="padding-left: 20px;">`;
      for (const project of orders[5].list) {
        htmlContent += `<li>${project}</li>`;
      }
      htmlContent += `</ol>`;
    }

    // Create report
    const report = {
      name: `Báo cáo up web nội bộ`,
      content: htmlContent,
    };

    res.header("Access-Control-Allow-Origin", "*");
    res.status(200).send(report);
  } catch (error: any) {
    console.error("[createWebUpdateReport]: ", error.message);
    res.status(500).send(`[createWebUpdateReport]: ${error.message}`);
  }
});

scriptRouter.post("/syncAirtableAndWeb", async (req: Request, res: Response) => {
  const requestedYears = ["2024"];
  const BATCH_SIZE = 25;

  try {
    for (const requestedYear of requestedYears) {
      const { totalAirtableDataList }: any = await fetchAirtableRecords(requestedYear);
      if (totalAirtableDataList.length <= 0) continue;

      // Process data in batches
      for (let i = 0; i < totalAirtableDataList.length; i += BATCH_SIZE) {
        const batch = totalAirtableDataList.slice(i, i + BATCH_SIZE);

        const promises = batch.map(async (airtableData: any) => {
          const collectionName = `du-an-${requestedYear}`;
          const collection = firestore.collection(collectionName);
          const querySnapshot = await collection.where("projectId", "==", airtableData["projectId"]).get();

          const projectProgressObj = await getProjectProgress(extractFolderId(airtableData.progressImagesUrl));
          if (projectProgressObj === undefined) return;

          const { thumbnailImage: projectThumbnail, progress: airtableProjectProgress }: any = projectProgressObj;

          let hoanCanhDescription = await getHoanCanhDescription(extractFolderId(airtableData.progressImagesUrl));
          if (hoanCanhDescription === undefined) {
            hoanCanhDescription = "";
          }

          // 1. Dự án mới
          if (querySnapshot.empty) {
            const newId = uuidv4().replace(/-/g, "").substring(0, 20);
            const postDocRef = firestore.collection(collectionName).doc(newId);
            const newProjectPost: ProjectPost = {
              id: newId,
              projectId: airtableData.projectId,
              name: airtableData.name,
              author: "Admin",
              slug: slugify(airtableData.projectId, { lower: true, strict: true }),
              createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
              updatedAt: firebase.firestore.Timestamp.fromDate(new Date()),
              thumbnail: projectThumbnail,
              category: collectionName,
              classification: getProjectClassification(airtableData.classification),
              status: airtableData.status,
              totalFund: airtableData.totalFund,
              location: airtableData.location,
              description: "", // TODO: team web fix manually - hiện tại chưa có
              donors: airtableData.donors,
              progress: airtableProjectProgress,
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

            // return await Promise.all([
            //   postDocRef.set(newProjectPost),
            //   upsertDocumentToIndex({ ...newProjectPost, doc_id: newId, collection_id: collectionName }),
            //   updateClassificationAndCategoryCounts(newProjectPost.classification, newProjectPost.category, +1),
            // ]);
          } else {
            const docId = querySnapshot.docs[0].id;
            const docData = querySnapshot.docs[0].data();

            // 2. Dự án thay đổi trạng thái
            if (docData.status !== airtableData.status) {
              const updatedProjectPost: ProjectPost = { ...(docData as ProjectPost), status: airtableData.status, updatedAt: firebase.firestore.Timestamp.fromDate(new Date()) };
              // return await Promise.all([collection.doc(docId).update(updatedProjectPost), upsertDocumentToIndex({ ...updatedProjectPost, doc_id: docId, collection_id: collectionName })]);
            }

            // 3. Dự án cập nhật thêm ảnh
            const webProjectProgress = docData.progressNew ?? docData.progress;
            for (let airSection of airtableProjectProgress) {
              const webSection = webProjectProgress.find((s: any) => s.name === airSection.name);
              if (airSection.images.length > webSection.images.length) {
                const updatedProjectPost: ProjectPost = {
                  ...(docData as ProjectPost),
                  progressNew: airtableProjectProgress,
                  updatedAt: firebase.firestore.Timestamp.fromDate(new Date()),
                };
                // return await Promise.all([collection.doc(docId).update(updatedProjectPost), upsertDocumentToIndex({ ...updatedProjectPost, doc_id: docId, collection_id: collectionName })]);
              }
            }

            // 4. Dự án cập nhật ảnh đại diện
            if (docData.thumbnail === "" && projectThumbnail !== "") {
              const updatedProjectPost: ProjectPost = {
                ...(docData as ProjectPost),
                thumbnail: projectThumbnail,
                updatedAt: firebase.firestore.Timestamp.fromDate(new Date()),
              };
              // return await Promise.all([collection.doc(docId).update(updatedProjectPost), upsertDocumentToIndex({ ...updatedProjectPost, doc_id: docId, collection_id: collectionName })]);
            }

            // 5. Dự án cập nhật phiếu khảo sát
            const webProjectContent = docData.contentNew ?? docData.content;
            const webHoanCanhDescription = webProjectContent.tabs.find((t: any) => t.name === "Hoàn cảnh").description;
            if (webHoanCanhDescription === "" && hoanCanhDescription !== "") {
              const updatedProjectPost: ProjectPost = {
                ...(docData as ProjectPost),
                contentNew: {
                  tabs: webProjectContent.tabs.map((t: any) =>
                    t.name === "Hoàn cảnh"
                      ? {
                          name: "Hoàn cảnh",
                          description: hoanCanhDescription,
                          slide_show: [],
                        }
                      : t
                  ),
                },
                updatedAt: firebase.firestore.Timestamp.fromDate(new Date()),
              };
              // return await Promise.all([collection.doc(docId).update(updatedProjectPost), upsertDocumentToIndex({ ...updatedProjectPost, doc_id: docId, collection_id: collectionName })]);
            }
          }
        });

        await Promise.all(promises);
      }
    }

    res.header("Access-Control-Allow-Origin", "*");
    res.status(200).send({});
  } catch (error: any) {
    console.error("[syncAirtableAndWeb]: ", error.message);
    res.status(500).send(`[syncAirtableAndWeb]: ${error.message}`);
  }
});

export default scriptRouter;

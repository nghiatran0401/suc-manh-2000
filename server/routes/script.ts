import express from "express";
import { Request, Response } from "express";
import { NewsPost, ProjectPost } from "../../index";
import { v4 as uuidv4 } from "uuid";
import slugify from "slugify";
import { firestore, firebase } from "../firebase";
import { fetchAirProjectRecords, standardizePostTitle } from "../services/airtable";
import { getProjectProgress, getHoanCanhDescription, getAllFileNames, checkIfRefreshTokenValid, saveGoogleAuthRefreshToken, generateAuthUrl } from "../services/googledrive";
import { removeDocumentFromIndex, upsertDocumentToIndex } from "../services/redis";
import { updateClassificationAndCategoryCounts, formatDate, extractFolderId, getProjectClassification, vietnameseProjectStatus } from "../utils/index";

const scriptRouter = express.Router();

scriptRouter.get("/oauth2callback", async (req: Request, res: Response) => {
  const code = req.query.code as string;

  try {
    await saveGoogleAuthRefreshToken(decodeURIComponent(code));
    res.redirect(`${process.env.ADMIN_URL}/thong-bao?googleOauthSuccess=true`);
  } catch (err: any) {
    res.status(500).send({ error: `[oauth2callback] failed: ${err.response ? err.response.data : err.message}` });
  }
});

// Báo cáo tiến độ
// 0. Thống kê số liệu
// 1. Dự án mới khởi công
// 2. Dự án đã khởi công nhưng chưa có tiến độ
// 3. Dự án đang được xây dựng
// 4. Dự án đã hoàn thiện

scriptRouter.post("/createProjectProgressReportZalo", async (req: Request, res: Response) => {
  const requestedYears = ["2023", "2024", "2025"];
  const orders: any = {
    0: {
      name: "Thống kê số liệu",
      list: {
        2023: {
          total: -1,
          completed: -1,
          inProgress: 0,
        },
        2024: {
          total: 0,
          completed: 0,
          inProgress: 0,
        },
        2025: {
          total: 0,
          completed: 0,
          inProgress: 0,
        },
      },
    },
    1: { name: "Dự án mới khởi công", list: { Trường: [], "Khu Nội Trú": [], "Nhà Hạnh Phúc": [], Cầu: [] } },
    2: { name: "Dự án đã khởi công nhưng chưa có tiến độ", list: { Trường: [], "Khu Nội Trú": [], "Nhà Hạnh Phúc": [], Cầu: [] } },
    3: { name: "Dự án đang được xây dựng", list: { Trường: [], "Khu Nội Trú": [], "Nhà Hạnh Phúc": [], Cầu: [] } },
    4: { name: "Dự án đã hoàn thiện", list: { Trường: [], "Khu Nội Trú": [], "Nhà Hạnh Phúc": [], Cầu: [] } },
  };
  let htmlContent = ``;
  const BATCH_SIZE = 25;

  const valid = await checkIfRefreshTokenValid();
  if (!valid) {
    const authUrl = generateAuthUrl();
    res.status(200).send({ authUrl: authUrl });
  }

  try {
    for (const requestedYear of requestedYears) {
      const { totalAirtableDataList }: any = await fetchAirProjectRecords(requestedYear);
      if (totalAirtableDataList.length <= 0) continue;

      const collectionName = `du-an-${requestedYear}`;
      const collection = firestore.collection(collectionName);

      for (let i = 0; i < totalAirtableDataList.length; i += BATCH_SIZE) {
        const batch = totalAirtableDataList.slice(i, i + BATCH_SIZE);

        const promises = batch.map(async (airtableData: any) => {
          if (!airtableData["rawStatus"].match(/^\d+/)) return;
          const statusNumber = parseInt(airtableData["rawStatus"].match(/^\d+/)[0], 10);
          if (statusNumber >= 11 && statusNumber <= 17) {
            orders[0].list[requestedYear].total += 1;
          }
          if (statusNumber >= 13 && statusNumber <= 17) {
            orders[0].list[requestedYear].completed += 1;
          }
          if (statusNumber >= 11 && statusNumber <= 12) {
            orders[0].list[requestedYear].inProgress += 1;
          }

          const querySnapshot = await collection.where("projectId", "==", airtableData["projectId"]).get();
          if (!querySnapshot.empty) {
            const docData = querySnapshot.docs[0].data();

            // 1. Dự án mới khởi công
            if (docData.status === "can-quyen-gop" && airtableData.status === "dang-xay-dung") {
              if (!orders[1].list[airtableData.classification]) return;
              orders[1].list[airtableData.classification].push({ name: airtableData.projectInitName });
              return;
            }

            if (airtableData.isInProgress === undefined || airtableData.progressNoteZalo === undefined) return;

            // 2. Dự án đã khởi công nhưng chưa có tiến độ
            if (docData.status === "dang-xay-dung" && airtableData.status === "dang-xay-dung" && airtableData.isInProgress === false) {
              if (!orders[2].list[airtableData.classification]) return;
              orders[2].list[airtableData.classification].push({ name: airtableData.projectInitName, progressNoteZalo: airtableData.progressNoteZalo });
              return;
            }

            // 3. Dự án đang được xây dựng
            if (docData.status === "dang-xay-dung" && airtableData.status === "dang-xay-dung" && airtableData.isInProgress === true) {
              if (!orders[3].list[airtableData.classification]) return;
              orders[3].list[airtableData.classification].push({ name: airtableData.projectInitName });
              return;
            }

            // 4. Dự án đã hoàn thiện
            if (docData.status === "dang-xay-dung" && airtableData.status === "da-hoan-thanh") {
              if (!orders[4].list[airtableData.classification]) return;
              orders[4].list[airtableData.classification].push({ name: airtableData.projectInitName });
              return;
            }
          }
        });

        await Promise.all(promises);
      }
    }

    const totalKhoiCongProjects = 486 + orders[0].list["2024"].total + orders[0].list["2025"].total;

    // Generate HTML content
    htmlContent += `<p style="font-size: 1.5rem;"><strong>Thống kê số liệu</strong></p>`;
    htmlContent += `<p style="font-size: 1.2rem;">Tổng số dự án đã khởi công từ 2012 đến nay: <strong>${totalKhoiCongProjects}</strong></p>`;
    htmlContent += `<p style="font-size: 1.2rem;"><strong>Năm 2023</strong></p>`;
    htmlContent += `<ul style="list-style-type: disc; padding-left: 20px;">`;
    htmlContent += `<li>Tổng dự án đã khởi công: <strong>${orders[0].list["2023"].total}</strong></li>`;
    htmlContent += `<li>Tổng dự án đã hoàn thành: <strong>${orders[0].list["2023"].completed}</strong></li>`;
    htmlContent += `<li>Tổng dự án đang được xây: <strong>${orders[0].list["2023"].inProgress}</strong></li>`;
    htmlContent += `</ul>`;
    htmlContent += `<p style="font-size: 1.2rem;"><strong>Năm 2024</strong></p>`;
    htmlContent += `<ul style="list-style-type: disc; padding-left: 20px;">`;
    htmlContent += `<li>Tổng dự án đã khởi công: <strong>${orders[0].list["2024"].total}</strong></li>`;
    htmlContent += `<li>Tổng dự án đã hoàn thành: <strong>${orders[0].list["2024"].completed}</strong></li>`;
    htmlContent += `<li>Tổng dự án đang được xây: <strong>${orders[0].list["2024"].inProgress}</strong></li>`;
    htmlContent += `</ul>`;
    htmlContent += `<p style="font-size: 1.2rem;"><strong>Năm 2025</strong></p>`;
    htmlContent += `<ul style="list-style-type: disc; padding-left: 20px;">`;
    htmlContent += `<li>Tổng dự án đã khởi công: <strong>${orders[0].list["2025"].total}</strong></li>`;
    htmlContent += `<li>Tổng dự án đã hoàn thành: <strong>${orders[0].list["2025"].completed}</strong></li>`;
    htmlContent += `<li>Tổng dự án đang được xây: <strong>${orders[0].list["2025"].inProgress}</strong></li>`;
    htmlContent += `</ul>`;
    for (let i = 1; i <= Object.keys(orders).length - 1; i++) {
      htmlContent += `<p style="font-size: 1.2rem;"><strong>${(Object.values(orders[i].list) as any).flat().length} ${orders[i].name}</strong></p>`;
      for (const [classification, projectList] of Object.entries(orders[i].list) as any) {
        if (projectList.length > 0) {
          htmlContent += `<p style="margin-top: revert;"><strong>${classification}</strong></p>`;
          htmlContent += `<ol style="padding-left: 20px;">`;
          for (const project of projectList) {
            htmlContent += `<li>${project.name} ${!project.progressNoteZalo ? "" : `=> ${project.progressNoteZalo}`}</li>`;
          }
          htmlContent += `</ol>`;
        }
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
  const requestedYears = ["2023", "2024", "2025"];
  const orders: any = {
    0: {
      name: "Thống kê số liệu",
      list: {
        2023: {
          total: -1,
          completed: -1,
          inProgress: 0,
        },
        2024: {
          total: 0,
          inProgress: 0,
          completed: 0,
        },
        2025: {
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

  const valid = await checkIfRefreshTokenValid();
  if (!valid) {
    const authUrl = generateAuthUrl();
    res.status(200).send({ authUrl: authUrl });
  }

  try {
    for (const requestedYear of requestedYears) {
      const { totalAirtableDataList }: any = await fetchAirProjectRecords(requestedYear);
      if (totalAirtableDataList.length <= 0) continue;

      const collectionName = `du-an-${requestedYear}`;
      const collection = firestore.collection(collectionName);

      for (let i = 0; i < totalAirtableDataList.length; i += BATCH_SIZE) {
        const batch = totalAirtableDataList.slice(i, i + BATCH_SIZE);

        const promises = batch.map(async (airtableData: any) => {
          if (!airtableData["rawStatus"].match(/^\d+/)) return;
          const statusNumber = parseInt(airtableData["rawStatus"].match(/^\d+/)[0], 10);
          if (statusNumber >= 11 && statusNumber <= 17) {
            orders[0].list[requestedYear].total += 1;
          }
          if (statusNumber >= 13 && statusNumber <= 17) {
            orders[0].list[requestedYear].completed += 1;
          }
          if (statusNumber >= 11 && statusNumber <= 12) {
            orders[0].list[requestedYear].inProgress += 1;
          }

          const querySnapshot = await collection.where("projectId", "==", airtableData["projectId"]).get();
          const projectProgressObj = await getProjectProgress(extractFolderId(airtableData.progressImagesUrl));
          if (projectProgressObj === undefined) return;
          const { thumbnailImage: projectThumbnail } = projectProgressObj;

          if (!querySnapshot.empty) {
            const docData = querySnapshot.docs[0].data();

            // 1. Dự án mới khởi công
            if (docData.status === "can-quyen-gop" && airtableData.status === "dang-xay-dung") {
              if (!orders[1].list[airtableData.classification]) return;
              orders[1].list[airtableData.classification].push({ name: airtableData.projectInitName });
              return;
            }

            if (airtableData.isInProgress === undefined || airtableData.progressNoteWeb === undefined) return;

            // 2. Dự án đã khởi công nhưng chưa có tiến độ
            if (airtableData.status === "dang-xay-dung" && airtableData.isInProgress === false) {
              if (!orders[2].list[airtableData.classification]) return;
              orders[2].list[airtableData.classification].push({ name: airtableData.projectInitName, progressNoteWeb: airtableData.progressNoteWeb });
              return;
            }

            // 3. Dự án đang được xây dựng
            if (airtableData.status === "dang-xay-dung" && airtableData.isInProgress === true) {
              if (!orders[3].list[airtableData.classification]) return;
              orders[3].list[airtableData.classification].push({ name: airtableData.projectInitName, projectThumbnail: projectThumbnail });
              slideshowImages.push({ caption: airtableData.projectInitName, image: projectThumbnail });
              return;
            }
          }
        });

        await Promise.all(promises);
      }
    }

    const totalKhoiCongProjects = 486 + orders[0].list["2024"].total + orders[0].list["2025"].total;

    // Generate HTML content
    // 0. Thống kê số liệu
    htmlContent += `<p style="font-size: 1.5rem;"><strong>Thống kê số liệu</strong></p>`;
    htmlContent += `<p style="font-size: 1.2rem;">Tổng số dự án đã khởi công từ 2012 đến nay: <strong>${totalKhoiCongProjects}</strong></p>`;
    htmlContent += `<p style="font-size: 1.2rem;"><strong>Năm 2023</strong></p>`;
    htmlContent += `<ul style="list-style-type: disc; padding-left: 20px;">`;
    htmlContent += `<li>Tổng dự án đã khởi công: <strong>${orders[0].list["2023"].total}</strong></li>`;
    htmlContent += `<li>Tổng dự án đã hoàn thành: <strong>${orders[0].list["2023"].completed}</strong></li>`;
    htmlContent += `<li>Tổng dự án đang được xây: <strong>${orders[0].list["2023"].inProgress}</strong></li>`;
    htmlContent += `</ul>`;
    htmlContent += `<p style="font-size: 1.2rem;"><strong>Năm 2024</strong></p>`;
    htmlContent += `<ul style="list-style-type: disc; padding-left: 20px;">`;
    htmlContent += `<li>Tổng dự án đã khởi công: <strong>${orders[0].list["2024"].total}</strong></li>`;
    htmlContent += `<li>Tổng dự án đã hoàn thành: <strong>${orders[0].list["2024"].completed}</strong></li>`;
    htmlContent += `<li>Tổng dự án đang được xây: <strong>${orders[0].list["2024"].inProgress}</strong></li>`;
    htmlContent += `</ul>`;
    htmlContent += `<p style="font-size: 1.2rem;"><strong>Năm 2025</strong></p>`;
    htmlContent += `<ul style="list-style-type: disc; padding-left: 20px;">`;
    htmlContent += `<li>Tổng dự án đã khởi công: <strong>${orders[0].list["2025"].total}</strong></li>`;
    htmlContent += `<li>Tổng dự án đã hoàn thành: <strong>${orders[0].list["2025"].completed}</strong></li>`;
    htmlContent += `<li>Tổng dự án đang được xây: <strong>${orders[0].list["2025"].inProgress}</strong></li>`;
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

// Báo cáo up web
// 1. DA mới
// 2. DA thay đổi trạng thái
// 3. DA không có phiếu khảo sát
// 4. DA không có ảnh hiện trạng
// 5. DA có vấn đề Nhà tài trợ
// 6. DA sai link GD
// 7. DA không có trạng thái (Follow up steps)
// 8. DA không có link GD

scriptRouter.post("/createWebUpdateReport", async (req: Request, res: Response) => {
  const requestedYears = ["2024", "2025"];
  const orders: any = {
    1: { name: "DA mới", list: [] },
    2: { name: "DA thay đổi trạng thái", list: [] },
    3: { name: "DA không có phiếu khảo sát", list: [] },
    4: { name: "DA không có ảnh hiện trạng", list: [] },
    5: { name: "DA có vấn đề Nhà tài trợ", list: [] },
    6: { name: "DA sai link GD", list: [] },
    7: { name: "DA không có trạng thái (Follow up steps)", list: [] },
    8: { name: "DA không có link GD", list: [] },
  };
  let htmlContent = ``;
  const BATCH_SIZE = 25;

  const valid = await checkIfRefreshTokenValid();
  if (!valid) {
    const authUrl = generateAuthUrl();
    res.status(200).send({ authUrl: authUrl });
  }

  try {
    for (const requestedYear of requestedYears) {
      const { totalAirtableDataList, totalAirtableErrors }: any = await fetchAirProjectRecords(requestedYear);
      if (totalAirtableDataList.length <= 0) continue;

      // DA không có link GD
      totalAirtableErrors["DA không có link GD"].map((da: any) => {
        const daName = standardizePostTitle(`${da.projectId} - ${da.projectInitName}`);
        orders[8].list.push(daName);
      });

      // DA không có trạng thái (Follow up steps)
      totalAirtableErrors["DA không có trạng thái (Follow up steps)"].map((da: any) => {
        const daName = standardizePostTitle(`${da.projectId} - ${da.projectInitName}`);
        orders[7].list.push(daName);
      });

      // DA có vấn đề Nhà tài trợ
      totalAirtableErrors["DA có vấn đề Nhà tài trợ"].map((da: any) => {
        if (da.noteMoneyDonors.length > 0) {
          const donorUpdate = `${da.projectId}: Chốt donors [${da.airDonorRecords.join(", ")}] - Note tiến độ [${da.noteMoneyDonors.join(", ")}]`;
          orders[5].list.push(donorUpdate);
        }
      });

      const collectionName = `du-an-${requestedYear}`;
      const collection = firestore.collection(collectionName);

      for (let i = 0; i < totalAirtableDataList.length; i += BATCH_SIZE) {
        const batch = totalAirtableDataList.slice(i, i + BATCH_SIZE);

        const promises = batch.map(async (airtableData: any) => {
          const querySnapshot = await collection.where("projectId", "==", airtableData["projectId"]).get();

          const projectProgressObj = await getProjectProgress(extractFolderId(airtableData.progressImagesUrl));
          if (!projectProgressObj) {
            orders[6].list.push(airtableData.name);
            return;
          }

          // DA không có ảnh hiện trạng
          const { progress: projectProgress }: any = projectProgressObj;
          if (!projectProgress.some((p: any) => p.name === "Ảnh hiện trạng" && p.images?.length > 0)) {
            orders[4].list.push(airtableData.name);
          }

          // DA không có phiếu khảo sát
          let hoanCanhDescription = await getHoanCanhDescription(extractFolderId(airtableData.progressImagesUrl));
          if (hoanCanhDescription === undefined) {
            hoanCanhDescription = "";
            orders[3].list.push(airtableData.name);
          }

          // DA mới
          if (querySnapshot.empty) {
            orders[1].list.push(airtableData.name);
          } else {
            const docData = querySnapshot.docs[0].data();
            // DA thay đổi trạng thái
            if (docData.status !== airtableData.status) {
              const statusUpdate = `${airtableData.name}: ${vietnameseProjectStatus(docData.status)} -> ${vietnameseProjectStatus(airtableData.status)}`;
              orders[2].list.push(statusUpdate);
            }
          }
        });

        await Promise.all(promises);
      }
    }

    // Generate HTML content
    for (let i = 1; i <= Object.keys(orders).length; i++) {
      htmlContent += `<p style="font-size: 1.2rem;"><strong>${orders[i].list.length} ${orders[i].name}</strong></p>`;
      if (orders[i].list.length > 0) {
        htmlContent += `<ol style="padding-left: 20px;">`;
        for (const item of orders[i].list) {
          htmlContent += `<li>${item}</li>`;
        }
        htmlContent += `</ol>`;
      }
    }

    // Create report
    const report = {
      name: `Báo cáo up web Zalo`,
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
  const requestedYears = ["2024", "2025"];
  const BATCH_SIZE = 25;

  const valid = await checkIfRefreshTokenValid();
  if (!valid) {
    const authUrl = generateAuthUrl();
    res.status(200).send({ authUrl: authUrl });
  }

  try {
    for (const requestedYear of requestedYears) {
      const { totalAirtableDataList, totalAirtableErrors }: any = await fetchAirProjectRecords(requestedYear);
      if (totalAirtableDataList.length <= 0) continue;

      const collectionName = `du-an-${requestedYear}`;
      const collection = firestore.collection(collectionName);

      // 6. Dự án hủy -> xóa trên web
      const cancelledProjectsPromises = totalAirtableErrors["DA hủy"].map(async (p: any) => {
        if (p["projectId"] !== null) {
          const querySnapshot = await collection.where("projectId", "==", p["projectId"]).get();
          if (!querySnapshot.empty) {
            const docRef = querySnapshot.docs[0].ref;
            const docData = querySnapshot.docs[0].data();

            return await Promise.all([
              docRef.delete(),
              removeDocumentFromIndex({ collection_id: collectionName, doc_id: querySnapshot.docs[0].id }),
              updateClassificationAndCategoryCounts(docData.classification, docData.category, -1),
            ]);
          }
        }
      });
      await Promise.all(cancelledProjectsPromises);

      for (let i = 0; i < totalAirtableDataList.length; i += BATCH_SIZE) {
        const batch = totalAirtableDataList.slice(i, i + BATCH_SIZE);

        const projectsPromises = batch.map(async (airtableData: any) => {
          const querySnapshot = await collection.where("projectId", "==", airtableData["projectId"]).get();

          const projectProgressObj = await getProjectProgress(extractFolderId(airtableData.progressImagesUrl));
          if (projectProgressObj === undefined) return;

          const { thumbnailImage: projectThumbnail, progress: airtableProjectProgress }: any = projectProgressObj;

          let hoanCanhDescription = await getHoanCanhDescription(extractFolderId(airtableData.progressImagesUrl));
          if (hoanCanhDescription === undefined) {
            hoanCanhDescription = "";
          }

          // Upload dự án mới
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
              donors: [],
              metadata: airtableData.metadata,
              progress: airtableProjectProgress,
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
                ],
              },
            };

            return await Promise.all([
              postDocRef.set(newProjectPost),
              upsertDocumentToIndex({ ...newProjectPost, doc_id: newId, collection_id: collectionName }),
              updateClassificationAndCategoryCounts(newProjectPost.classification, newProjectPost.category, +1),
            ]);
          }
          // Update dự án hiện tại
          else {
            const docId = querySnapshot.docs[0].id;
            const docData = querySnapshot.docs[0].data();

            const webProjectProgress = docData.progressNew ?? docData.progress;
            const isImagesUpdated = airtableProjectProgress.some((a: any) => a.images.length > webProjectProgress.find((w: any) => w.name === a.name).images.length);

            const updatedProjectPost: ProjectPost = {
              ...(docData as ProjectPost),
              name: docData.name !== airtableData.name ? airtableData.name : docData.name,
              totalFund: docData.totalFund !== airtableData.totalFund ? airtableData.totalFund : docData.totalFund,
              status: docData.status !== airtableData.status ? airtableData.status : docData.status,
              progressNew: isImagesUpdated ? airtableProjectProgress : webProjectProgress,
              thumbnail: isImagesUpdated || !docData.thumbnail ? projectThumbnail : docData.thumbnail,
              contentNew: {
                tabs: [
                  {
                    name: "Hoàn cảnh",
                    description: hoanCanhDescription,
                  },
                  {
                    name: "Nhà hảo tâm",
                    description: airtableData.financialStatementUrl,
                  },
                ],
              },
              location: airtableData.location,
              // donors: airtableData.donors,
              // metadata: airtableData.metadata,
              updatedAt: firebase.firestore.Timestamp.fromDate(new Date()),
            };

            return await Promise.all([collection.doc(docId).update(updatedProjectPost), upsertDocumentToIndex({ ...updatedProjectPost, doc_id: docId, collection_id: collectionName })]);
          }
        });
        await Promise.all(projectsPromises);
      }
    }

    res.header("Access-Control-Allow-Origin", "*");
    res.status(200).send({});
  } catch (error: any) {
    console.error("[syncAirtableAndWeb]: ", error.message);
    res.status(500).send(`[syncAirtableAndWeb]: ${error.message}`);
  }
});

scriptRouter.post("/chamPhamTool", async (req: Request, res: Response) => {
  const { folderId } = req.body;

  const valid = await checkIfRefreshTokenValid();
  if (!valid) {
    const authUrl = generateAuthUrl();
    res.status(200).send({ authUrl: authUrl });
  }

  try {
    const allFileNames = await getAllFileNames(folderId);
    res.header("Access-Control-Allow-Origin", "*");
    res.status(200).send(allFileNames);
  } catch (error: any) {
    console.error("[chamPhamTool]: ", error.message);
    res.status(500).send(`[chamPhamTool]: ${error.message}`);
  }
});

export default scriptRouter;

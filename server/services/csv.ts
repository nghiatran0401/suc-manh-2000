import { firestore } from "../firebase";
import csv from "csv-parser";
import { Storage } from "@google-cloud/storage";
import { v4 as uuidv4 } from "uuid";

// Initialize Google Cloud Storage
const storage = new Storage();
const bucketName = "gs://savvy-serenity-424116-g1.appspot.com";

async function getLatestCsvFile() {
  const [files] = await storage.bucket(bucketName).getFiles({ prefix: "projects_csv/" });
  const latestFile = files.sort((a: any, b: any) => {
    const dateA = new Date(a.metadata.updated);
    const dateB = new Date(b.metadata.updated);
    return dateB.getTime() - dateA.getTime();
  })[0];
  return latestFile;
}

async function fetchCsvData() {
  const latestFile = await getLatestCsvFile();
  const fileStream = latestFile.createReadStream();
  const records: any = [];

  return new Promise((resolve, reject) => {
    fileStream
      .pipe(csv())
      .on("data", (row) => {
        records.push(row);
      })
      .on("end", () => {
        resolve(records);
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}

async function getDonors(noteMoney: any, donorNames: any, projectId: string) {
  const donors: { donorId: string; donationId: string }[] = [];
  const donorErrors: any = { airDonorRecords: donorNames, noteMoneyDonors: [] };

  for (const line of noteMoney) {
    let donor = { donorId: "", donationId: "" };
    const match = line.match(/^\d+\.\s*(.+?)\s*:\s*(\d+)$/);

    if (match) {
      const donorName = match[1].trim();
      const donationAmount = parseInt(match[2], 10) * 1000000;

      // Check if the note matches with the donors array
      const donorMatch = donorNames.filter((r: any) => String(r) == String(donorName));
      if (donorMatch.length === 1) {
        // Create new Donor Doc
        const donorQuerySnapshot = await firestore.collection("donors").where("name", "==", donorName).get();
        if (donorQuerySnapshot.empty) {
          const newDonorId = uuidv4().replace(/-/g, "").substring(0, 20);
          // console.log(`Creating new donor: ${projectId} - ${donorName}`);
          const donorDocRef = firestore.collection("donors").doc(newDonorId);
          await donorDocRef.set({ id: newDonorId, name: donorName, type: "", logo: "", intro: "" });
          donor.donorId = newDonorId;
        } else {
          donor.donorId = donorQuerySnapshot.docs[0].id;
        }

        // Create new Donation Doc
        const donationQuerySnapshot = await firestore.collection("donations").where("donorId", "==", donor.donorId).where("projectId", "==", projectId).get();
        if (donationQuerySnapshot.empty) {
          const newDonationId = uuidv4().replace(/-/g, "").substring(0, 20);
          // console.log(`Creating new donation: ${projectId} - ${donorName} - ${donationAmount}`);
          const donationDocRef = firestore.collection("donations").doc(newDonationId);
          await donationDocRef.set({
            id: newDonationId,
            donorId: donor.donorId,
            projectId: projectId,
            amount: donationAmount,
          });
          donor.donationId = newDonationId;
        } else {
          donor.donationId = donationQuerySnapshot.docs[0].id;
        }

        donors.push(donor);
      } else {
        // Report donor error
        donorErrors.noteMoneyDonors.push(donorName);
      }
    }
  }

  return { donorsTemp: donors, donorErrors };
}

function splitDonorNames(donorString: string): string[] {
  const specialStrings = [
    "Nhóm Thiện Nguyện 3 Gốc (Đình Anh, Mạnh Tùng, Xuân Phong, Thanh Vân, Nguyễn Yên)",
    "Ngân hàng TMCP Quân Đội – Khối NHS, Ban kế hoạch & Marketing, Chi nhánh Hà Nội, Chi nhánh SDG3",
    "Nuoi Em CSVC 23,24",
    "Bà Nguyễn Thị Dung & Hội Viên Ba Miền Bắc, Trung, Nam",
  ];

  for (const special of specialStrings) {
    if (donorString.includes(special)) {
      const remaining = donorString
        .replace(special, "")
        .split(",")
        .map((name) => name.trim())
        .filter((name) => name);
      return [special.trim(), ...remaining];
    }
  }
  return donorString.split(",").map((name) => name.trim().replace(/\r/g, ""));
}

function getProjectStatus(statusFull: any) {
  if (!statusFull || !statusFull.match(/^\d+/)) return undefined;
  const statusNumber = parseInt(statusFull.trim().match(/^\d+/)[0], 10);
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

function standardizePostTitle(str: string) {
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

async function fetchProjectRecordsFromCsv(requestedYear: string) {
  const rawRecords: any = await fetchCsvData();
  const records = rawRecords.filter((r: any) => String(r["Năm thực hiện"]?.trim()) === requestedYear);

  const groupedRecords: any = {};
  const cancelledProjects = [];
  const noStatusProjects = [];
  const noGoogleDriveUrls = [];
  const donorIssues: any = [];

  for (const record of records) {
    const classification = record["Phân loại công trình"].trim();
    if (!groupedRecords[classification]) {
      groupedRecords[classification] = [];
    }

    if (record["Tên công trình"].includes("❌") || !record["DA"]) {
      cancelledProjects.push({ projectInitName: record["Tên công trình"], projectId: record["DA"] ? record["DA"] : null });
      continue;
    }

    const projectId = record["DA"].trim();
    const projectInitName = record["Tên công trình"].trim();
    const projectName = standardizePostTitle(`${projectId} - ${projectInitName}`);

    const projectStatus = getProjectStatus(record["Follow up Step"]);
    if (projectStatus === undefined) {
      noStatusProjects.push({ projectInitName: projectInitName, projectId: projectId });
      continue;
    }

    const progressImagesUrl = record["Link Drive"] ? record["Link Drive"].trim() : undefined;
    if (progressImagesUrl === undefined) {
      noGoogleDriveUrls.push({ projectInitName: projectInitName, projectId: projectId });
      continue;
    }

    let donors: any;
    const donorNames = record["Donors - CHỐT"] ? splitDonorNames(record["Donors - CHỐT"]) : [];
    const noteMoney = record["Note số tiền"] ? record["Note số tiền"].split("\n") : [];

    const qualifiedDonors = projectStatus && ["dang-xay-dung", "da-hoan-thanh"].includes(projectStatus);
    if (donorNames.length <= 0 || !noteMoney || !qualifiedDonors) {
      donors = [];
    } else {
      const { donorsTemp, donorErrors } = await getDonors(noteMoney, donorNames, projectId);
      donors = donorsTemp;
      donorIssues.push({ ...donorErrors, projectId: projectId });
    }

    const csvData = {
      projectId: projectId,
      projectInitName: projectInitName,
      name: projectName,
      classification: classification,
      rawStatus: record["Follow up Step"] ? record["Follow up Step"].trim() : "",
      status: projectStatus,
      subStatus: record["Aki xác nhận góp lẻ"] && record["Aki xác nhận góp lẻ"].includes("Đang góp lẻ") ? "dang-gop-le" : "",
      totalFund: record["Thành tiền"] ? Number(String(record["Thành tiền"]).replace("VNĐ ", "").trim()) : "",
      donors: donors,
      location: {
        province: record["Tỉnh/thành"] ? record["Tỉnh/thành"].trim() : "",
        district: record["Huyện"] ? record["Huyện"].trim() : "",
        commune: record["Xã"] ? record["Xã"].trim() : "",
      },
      metadata: {
        constructionItems: record["Hạng mục công trình"] ? record["Hạng mục công trình"].trim() : "",
        constructionUnit: record["NE Công trình"] ? record["NE Công trình"].trim() : "",
        type: record["Hạng mục"] ? record["Hạng mục"].trim() : "",
        stage: record["Cấp"] ? record["Cấp"].trim() : "",
        totalStudents: record["Số HS"] ? record["Số HS"] : "",
        totalClassrooms: record["Số PH"] ? record["Số PH"] : "",
        totalPublicAffairsRooms: record["Số CV"] ? record["Số CV"] : "",
        totalRooms: record["Số p.ở"] ? record["Số p.ở"] : "",
        totalKitchens: record["Số bếp"] ? record["Số bếp"] : "",
        totalToilets: record["Số WC"] ? record["Số WC"] : "",
        start_date: record["Ngày KC"] ? record["Ngày KC"].trim() : "",
        end_date: record["Ngày KT"] ? record["Ngày KT"].trim() : "",
      },
      progressImagesUrl: progressImagesUrl,
      financialStatementUrl: record["Link sao kê"] ? record["Link sao kê"].trim() : "",
      trelloCardUrl: record["Link Trello"] ? record["Link Trello"].trim() : "",
      isInProgress: record["Ảnh tiến độ (Check)"],
      progressNoteWeb: record["Note tiến độ Web"] ? record["Note tiến độ Web"] : "",
      progressNoteZalo: record["Note tiến độ"] ? record["Note tiến độ"] : "",
    };

    groupedRecords[classification].push(csvData);
  }

  const totalCsvDataList = (Object.values(groupedRecords) as any).flat();
  const totalCsvErrors = { "DA hủy": cancelledProjects, "DA không có trạng thái (Follow up steps)": noStatusProjects, "DA không có link GD": noGoogleDriveUrls, "DA có vấn đề Nhà tài trợ": donorIssues };

  return { totalCsvDataList, totalCsvErrors };
}

export { fetchProjectRecordsFromCsv };

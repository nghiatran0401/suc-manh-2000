import path from "path";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import { firestore, firebase } from "../firebase";
import Airtable from "airtable";
import Bottleneck from "bottleneck";
dotenv.config({ path: path.resolve(__dirname, "../.env") });

Airtable.configure({ endpointUrl: "https://api.airtable.com", apiKey: process.env.AIRTABLE_API_KEY });
const base = Airtable.base("appWc36BLa58SIqi8");
const PROJECT_TABLE = "Công trình Total";
const DONOR_TABLE = "Tài trợ";
const AIRTABLE_VIEW = "Nghia Web";

// Create a limiter with a max rate of 5 requests per second
const limiter = new Bottleneck({ maxConcurrent: 1, minTime: 200 });
const limitedSelect = limiter.wrap((tableName: any, options: any) => {
  return new Promise((resolve, reject) => {
    base(tableName)
      .select(options)
      .all()
      .then((records) => resolve(records))
      .catch((err) => reject(err));
  });
});

function getProjectStatus(statusFull: any) {
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

const totalErrorsMap = new Map();
async function fetchAirDonorRecords(donorIds: string[]) {
  const airDonorRecords = [];
  for (let i = 0; i < donorIds.length; i++) {
    const donorRecord = await base(DONOR_TABLE).find(donorIds[i]);

    const getTotalProjects = () => {
      const total = donorRecord.get("Công trình Total");
      const total6 = donorRecord.get("Công trình Total 6");

      if (!total && !total6) {
        return [];
      } else if (total && !total6) {
        return total;
      } else if (!total && total6) {
        return total6;
      } else if (Array.isArray(total) && Array.isArray(total6)) {
        if (JSON.stringify(total) === JSON.stringify(total6)) {
          return total;
        } else {
          const name = donorRecord.get("Tên Tài Trợ") ?? undefined;
          if (!name) return total;
          if (!totalErrorsMap.has(name)) {
            totalErrorsMap.set(name, true);
          }
          return total;
        }
      } else {
        console.error(`Error: ${donorRecord.get("Tên Tài Trợ") ?? ""}`);
        return [];
      }
    };

    const donor = {
      name: donorRecord.get("Tên Tài Trợ") ?? "",
      intro: donorRecord.get("Giới thiệu Cty ( lên MoMo )") ?? "",
      logo: donorRecord.get("Logo Drive") ?? "",
      type: donorRecord.get("Loại") ?? "",
      employeeCount: donorRecord.get("Employees") ?? "",
      totalProjects: getTotalProjects(),
    };
    airDonorRecords.push(donor);
  }
  return airDonorRecords;
}

async function getDonors(noteMoney: any, airDonorRecords: any, projectId: string) {
  const donors: { donorId: string; donationId: string }[] = [];
  const donorErrors: any = { airDonorRecords: airDonorRecords.map((r: any) => r.name), noteMoneyDonors: [] };

  for (const line of noteMoney) {
    let donor = { donorId: "", donationId: "" };
    const match = line.match(/^\d+\.\s*(.+?)\s*:\s*(\d+)$/);

    if (match) {
      const donorName = match[1];
      const donationAmount = parseInt(match[2], 10) * 1000000;

      // Check if the note matches with the donors array
      const donorMatch = airDonorRecords.filter((r: any) => r.name === donorName);
      if (donorMatch.length === 1) {
        // Create new Donor Doc
        const donorQuerySnapshot = await firestore.collection("donors").where("name", "==", donorName).get();
        if (donorQuerySnapshot.empty) {
          const newDonorId = uuidv4().replace(/-/g, "").substring(0, 20);
          console.log(`Creating new donor: ${projectId} - ${donorName}`);
          const donorDocRef = firestore.collection("donors").doc(newDonorId);
          await donorDocRef.set(donorMatch[0]);
          donor.donorId = newDonorId;
        } else {
          donor.donorId = donorQuerySnapshot.docs[0].id;
        }

        // Create new Donation Doc
        const donationQuerySnapshot = await firestore.collection("donations").where("donorId", "==", donor.donorId).where("projectId", "==", projectId).get();
        if (donationQuerySnapshot.empty) {
          const newDonationId = uuidv4().replace(/-/g, "").substring(0, 20);
          console.log(`Creating new donation: ${projectId} - ${donorName} - ${donationAmount}`);
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

async function fetchAirProjectRecords(requestedYear: string) {
  // Report issues/bugs
  const cancelledProjects = [];
  const noStatusProjects = [];
  const noGoogleDriveUrls = [];
  const donorIssues = [];

  try {
    const records: any = await limitedSelect(PROJECT_TABLE, {
      view: AIRTABLE_VIEW,
      filterByFormula: `{Năm thực hiện} = '${requestedYear}'`,
      sort: [{ field: "DA", direction: "asc" }],
    });

    const groupedRecords: any = {};
    for (const record of records) {
      const classification = record.get("Phân loại công trình").trim();
      if (!groupedRecords[classification]) {
        groupedRecords[classification] = [];
      }

      if (record.get("Tên công trình").includes("❌") || !record.get("DA")) {
        cancelledProjects.push({ projectInitName: record.get("Tên công trình"), projectId: record.get("DA") ? record.get("DA") : null });
        continue;
      }

      const projectId = record.get("DA").trim();
      const projectInitName = record.get("Tên công trình").trim();
      const projectName = standardizePostTitle(`${projectId} - ${projectInitName}`);

      const projectStatus = record.get("Follow up Step") ? getProjectStatus(record.get("Follow up Step").trim()) : undefined;
      if (projectStatus === undefined) {
        noStatusProjects.push({ projectInitName: projectInitName, projectId: projectId });
        continue;
      }

      const progressImagesUrl = record.get("Link Drive") ? record.get("Link Drive").trim() : undefined;
      if (progressImagesUrl === undefined) {
        noGoogleDriveUrls.push({ projectInitName: projectInitName, projectId: projectId });
        continue;
      }

      let donors: any;
      const donorIds = record.get("Donors - CHỐT") ? record.get("Donors - CHỐT") : [];
      const noteMoney = record.get("Note số tiền") ? record.get("Note số tiền").split("\n") : undefined;
      const qualifiedDonors = projectStatus && ["dang-xay-dung", "da-hoan-thanh"].includes(projectStatus);
      if (donorIds.length <= 0 || !noteMoney || !qualifiedDonors) {
        donors = [];
      } else {
        const airDonorRecords = await fetchAirDonorRecords(donorIds);
        const { donorsTemp, donorErrors } = await getDonors(noteMoney, airDonorRecords, projectId);
        donors = donorsTemp;
        donorIssues.push({ ...donorErrors, projectId: projectId });
      }

      const airtableData = {
        projectId: projectId,
        projectInitName: projectInitName,
        name: projectName,
        classification: classification,
        rawStatus: record.get("Follow up Step") ? record.get("Follow up Step").trim() : "",
        status: projectStatus,
        totalFund: record.get("Trị giá tiền") ? Number(String(record.get("Trị giá tiền")).replace("VNĐ ", "").trim()) : "",
        donors: donors,
        location: {
          province: record.get("Tỉnh/thành (update)") ? record.get("Tỉnh/thành (update)")[0] : "",
          district: record.get("Huyện") ? record.get("Huyện").trim() : "",
          commune: record.get("Xã") ? record.get("Xã").trim() : "",
        },
        metadata: {
          constructionItems: record.get("Hạng mục công trình") ? record.get("Hạng mục công trình").trim() : "",
          constructionUnit: record.get("NE Công trình") ? record.get("NE Công trình")[0] : "",
          type: record.get("Hạng mục") ? record.get("Hạng mục").trim() : "",
          stage: record.get("Cấp") ? record.get("Cấp").trim() : "",
          totalStudents: record.get("Số HS") ? record.get("Số HS") : "",
          totalClassrooms: record.get("Số PH") ? record.get("Số PH") : "",
          totalPublicAffairsRooms: record.get("Số CV") ? record.get("Số CV") : "",
          totalRooms: record.get("Số p.ở") ? record.get("Số p.ở") : "",
          totalKitchens: record.get("Số bếp") ? record.get("Số bếp") : "",
          totalToilets: record.get("Số WC") ? record.get("Số WC") : "",
          start_date: record.get("Ngày KC") ? record.get("Ngày KC").trim() : "",
          end_date: record.get("Ngày KT") ? record.get("Ngày KT").trim() : "",
        },
        progressImagesUrl: progressImagesUrl,
        financialStatementUrl: record.get("Link sao kê") ? record.get("Link sao kê").trim() : "",
        trelloCardUrl: record.get("Link Trello") ? record.get("Link Trello").trim() : "",
        isInProgress: record.get("Ảnh Tiến độ (check)") ? true : false,
        progressNoteWeb: record.get("Note tiến độ Web") ? record.get("Note tiến độ Web") : "",
        progressNoteZalo: record.get("Note tiến độ") ? record.get("Note tiến độ") : "",
      };

      groupedRecords[classification].push(airtableData);
    }

    const totalAirtableDataList = (Object.values(groupedRecords) as any).flat();
    const totalAirtableErrors = { "DA hủy": cancelledProjects, "DA không có trạng thái (Follow up steps)": noStatusProjects, "DA không có link GD": noGoogleDriveUrls, "DA có vấn đề Nhà tài trợ": donorIssues };

    return { totalAirtableDataList, totalAirtableErrors };
  } catch (err) {
    console.error("[fetchAirProjectRecords] - error: ", err);
    return [];
  }
}

export { getProjectStatus, standardizePostTitle, fetchAirProjectRecords };

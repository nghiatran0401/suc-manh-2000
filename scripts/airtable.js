const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const Airtable = require("airtable");
const Bottleneck = require("bottleneck");

Airtable.configure({ endpointUrl: "https://api.airtable.com", apiKey: process.env.AIRTABLE_API_KEY });
const base = Airtable.base("appWc36BLa58SIqi8");
const PROJECT_TABLE = "Công trình Total";
const DONOR_TABLE = "Tài trợ";
const AIRTABLE_VIEW = "Nghia Web";

// Create a limiter with a max rate of 5 requests per second
const limiter = new Bottleneck({ maxConcurrent: 1, minTime: 200 });

// Wrap the Airtable API call function with the limiter
const limitedSelect = limiter.wrap((tableName, options) => {
  return new Promise((resolve, reject) => {
    base(tableName)
      .select(options)
      .all()
      .then((records) => resolve(records))
      .catch((err) => reject(err));
  });
});

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

async function getDonorsFromIds(donorIds) {
  const donors = [];
  for (const donorId of donorIds) {
    const record = await base(DONOR_TABLE).find(donorId);
    const donor = {
      name: record.get("Tên Tài Trợ"),
      totalProjects: record.get("Công trình Total") ? record.get("Công trình Total").length : 0,
      notes: record.get("Notes"),
      contact: record.get("Thông tin liên hệ "),
      intro: record.get("Giới thiệu Cty ( lên MoMo )"),
      logo: record.get("Logo Drive"),
    };
    donors.push(donor);
  }
  return donors;
}

async function fetchAirtableRecords(requestedYear) {
  // Report issues/bugs
  const cancelledProjects = [];
  const noStatusProjects = [];
  const noGoogleDriveUrls = [];

  try {
    const records = await limitedSelect(PROJECT_TABLE, {
      view: AIRTABLE_VIEW,
      filterByFormula: `{Năm thực hiện} = '${requestedYear}'`,
      sort: [{ field: "DA", direction: "asc" }],
    });

    const groupedRecords = {};
    for (const record of records) {
      const classification = record.get("Phân loại công trình").trim();
      if (!groupedRecords[requestedYear]) {
        groupedRecords[requestedYear] = {};
      }
      if (!groupedRecords[requestedYear][classification]) {
        groupedRecords[requestedYear][classification] = [];
      }

      if (record.get("Tên công trình").includes("❌") || !record.get("DA")) {
        cancelledProjects.push(record.get("DA"));
        continue;
      }

      const projectId = record.get("DA").trim();
      const projectInitName = record.get("Tên công trình").trim();
      const projectName = standardizeString(`${projectId} - ${projectInitName}`);

      const projectStatus = record.get("Follow up Step") ? getProjectStatus(record.get("Follow up Step").trim()) : undefined;
      if (projectStatus === undefined) {
        noStatusProjects.push(projectId);
        continue;
      }

      const progressImagesUrl = record.get("Link Drive") ? record.get("Link Drive").trim() : undefined;
      if (!progressImagesUrl) {
        noGoogleDriveUrls.push(projectId);
        continue;
      }

      const projectDonorIds = record.get("Donors - CHỐT");
      const projectDonors = !projectDonorIds || projectDonorIds.length === 0 ? [] : await getDonorsFromIds(projectDonorIds);

      const airtableData = {
        projectId: projectId,
        name: projectName,
        classification: classification,
        status: projectStatus,
        totalFund: record.get("Trị giá tiền") ? Number(String(record.get("Trị giá tiền")).replace("VNĐ ", "").trim()) : undefined,
        donors: projectDonors,
        location: {
          province: record.get("Tỉnh/thành (update)"),
          district: record.get("Huyện"),
          commune: record.get("Xã"),
        },
        metadata: {
          constructionItems: record.get("Hạng mục công trình") ? record.get("Hạng mục công trình").trim() : "",
          type: record.get("Hạng mục") ? record.get("Hạng mục").trim() : "",
          stage: record.get("Cấp") ? record.get("Cấp").trim() : "",
          totalStudents: Number(record.get("Số HS")) ?? 0,
          totalClassrooms: Number(record.get("Số PH")) ?? 0,
          totalPublicAffairsRooms: Number(record.get("Số CV")) ?? 0,
          totalRooms: Number(record.get("Số p.ở")) ?? 0,
          totalKitchens: Number(record.get("Số bếp")) ?? 0,
          totalToilets: Number(record.get("Số WC")) ?? 0,
          start_date: record.get("Ngày KC") ? record.get("Ngày KC").trim() : "",
          end_date: record.get("Ngày KT") ? record.get("Ngày KT").trim() : "",
        },
        progressImagesUrl: progressImagesUrl,
        financialStatementUrl: record.get("Link sao kê") ? record.get("Link sao kê").trim() : "",
        trelloCardUrl: record.get("Link Trello") ? record.get("Link Trello").trim() : undefined,
      };

      groupedRecords[requestedYear][classification].push(airtableData);
    }

    const totalAirtableData = Object.values(groupedRecords[requestedYear]).flat();

    // Report issues/bugs
    console.log("Year: ", requestedYear);
    console.log("Total: ", totalAirtableData.length);
    console.log("----------------------------------------");
    // if (cancelledProjects.length > 0) console.log(`Cancelled: ${cancelledProjects.length}`, cancelledProjects);
    if (noStatusProjects.length > 0) console.log(`No status: ${noStatusProjects.length}`, noStatusProjects);
    if (noGoogleDriveUrls.length > 0) console.log(`No GD links: ${noGoogleDriveUrls.length}`, noGoogleDriveUrls);
    console.log("----------------------------------------");

    return totalAirtableData;
  } catch (err) {
    console.error("[fetchAirtableRecords] - error: ", err);
    return [];
  }
}

module.exports = { getProjectStatus, standardizeString, fetchAirtableRecords };

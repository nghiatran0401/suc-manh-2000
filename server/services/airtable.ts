import path from "path";
import dotenv from "dotenv";
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

async function getDonorsFromIds(donorIds: any) {
  const donors = [];
  for (const donorId of donorIds) {
    const record = await base(DONOR_TABLE).find(donorId);
    const donor = {
      name: record.get("Tên Tài Trợ") ?? "",
      totalProjects: record.get("Công trình Total") ? (record.get("Công trình Total") as any).length : 0,
      notes: record.get("Notes") ?? "",
      contact: record.get("Thông tin liên hệ ") ?? "",
      intro: record.get("Giới thiệu Cty ( lên MoMo )") ?? "",
      logo: record.get("Logo Drive") ?? "",
    };
    donors.push(donor);
  }
  return donors;
}

async function fetchAirtableRecords(requestedYear: string) {
  // Report issues/bugs
  const cancelledProjects = [];
  const noStatusProjects = [];
  const noGoogleDriveUrls = [];

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

      const projectDonorIds = record.get("Donors - CHỐT");
      const projectDonors = !projectDonorIds || projectDonorIds.length === 0 ? [] : await getDonorsFromIds(projectDonorIds);

      const airtableData = {
        projectId: projectId,
        projectInitName: projectInitName,
        name: projectName,
        classification: classification,
        status: projectStatus,
        totalFund: record.get("Trị giá tiền") ? Number(String(record.get("Trị giá tiền")).replace("VNĐ ", "").trim()) : "",
        donors: projectDonors,
        location: {
          province: record.get("Tỉnh/thành (update)") ? record.get("Tỉnh/thành (update)")[0] : "",
          district: record.get("Huyện") ? record.get("Huyện").trim() : "",
          commune: record.get("Xã") ? record.get("Xã").trim() : "",
        },
        metadata: {
          constructionItems: record.get("Hạng mục công trình") ? record.get("Hạng mục công trình").trim() : "",
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
    const totalAirtableErrors = { "DA không có trạng thái (Follow up steps)": noStatusProjects, "DA không có link GD": noGoogleDriveUrls }; // "DA hủy": cancelledProjects

    return { totalAirtableDataList, totalAirtableErrors };
  } catch (err) {
    console.error("[fetchAirtableRecords] - error: ", err);
    return [];
  }
}

export { getProjectStatus, standardizePostTitle, fetchAirtableRecords };

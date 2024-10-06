import { firestore } from "../firebase";

async function updateClassificationAndCategoryCounts(classification: string | undefined, category: string | undefined, variant: number) {
  const classificationDoc = await firestore.collection("counts").doc("classification").get();
  const categoryDoc = await firestore.collection("counts").doc("category").get();

  if (classification !== undefined && classificationDoc.exists) {
    const classificationCounts: any = classificationDoc.data();
    classificationCounts[classification] = (classificationCounts[classification] || 0) + variant;
    await firestore.collection("counts").doc("classification").set(classificationCounts);
  }

  if (category !== undefined && categoryDoc.exists) {
    const categoryCounts: any = categoryDoc.data();
    categoryCounts[category] = (categoryCounts[category] || 0) + variant;
    await firestore.collection("counts").doc("category").set(categoryCounts);
  }
}

function formatDate(date: any) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function extractFolderId(ggDriveUrl: any) {
  const match = ggDriveUrl.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  const folderId = match ? match[1] : undefined;
  return folderId;
}

function getProjectClassification(classification: string) {
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
      return "loai-khac";
  }
}

function vietnameseProjectStatus(status: string) {
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

export { updateClassificationAndCategoryCounts, formatDate, extractFolderId, getProjectClassification, vietnameseProjectStatus };

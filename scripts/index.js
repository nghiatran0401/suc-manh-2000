const { firestore, bucket } = require("./firebase");
const fs = require("fs");
const path = require("path");
const projectsData = require("../transformed_pages.json");
const newsData = require("../transformed_posts.json");

async function updateSlugForAllDocuments(original_data) {
  const collections = await firestore.listCollections();
  for (const collection of collections) {
    const snapshot = await collection.get();
    for (const doc of snapshot.docs) {
      const data = doc.data();
      if (data.hasOwnProperty("slug")) {
        const d = original_data.find((project) => String(project.id) === String(doc.id));
        if (d) {
          const newSlug = d.slug;
          console.log("Updating slug for", doc.id, "from", data.slug, "to", newSlug);
          await doc.ref.update({ slug: newSlug });
        }
      }
    }
  }
}

async function moveDocument(sourceCollectionName, destinationCollectionName, docId) {
  const sourceDocRef = firestore.collection(sourceCollectionName).doc(docId);
  const destinationDocRef = firestore.collection(destinationCollectionName).doc(docId);

  const doc = await sourceDocRef.get();

  if (!doc.exists) {
    console.log(`No document found with id: ${docId}`);
    return;
  }

  const data = doc.data();

  await firestore.runTransaction(async (transaction) => {
    transaction.set(destinationDocRef, data);
    transaction.delete(sourceDocRef);
  });

  console.log(`Moved document with id: ${docId} from ${sourceCollectionName} to ${destinationCollectionName}`);
}

async function extractProvincesFromName() {
  const collections = await firestore.listCollections();
  const targetCollections = collections.filter((col) => col.id.includes("du-an"));
  const provinces = {};

  for (const collection of targetCollections) {
    const snapshot = await collection.get();

    for (let i = 0; i < snapshot.docs.length; i++) {
      const doc = snapshot.docs[i];
      const data = doc.data();

      if (data.name) {
        const parts = data.name.split(/ - |-|, /); // Split by " - ", "-", or ", "
        const lastPart = parts[parts.length - 1];
        const cleanedString = removeSpecificWords(capitalizeEachWord(lastPart), ["Tỉnh", "tỉnh", "Tinh", "tinh"]);

        if (
          capitalizeEachWord(cleanedString).includes("DA") ||
          capitalizeEachWord(cleanedString).includes("Huyện") ||
          capitalizeEachWord(cleanedString).includes("Trường") ||
          capitalizeEachWord(cleanedString).split(" ").length > 2 ||
          capitalizeEachWord(cleanedString).includes(".") ||
          capitalizeEachWord(cleanedString).includes("Đb")
        ) {
          await doc.ref.update({ location: { province: null } });
          continue;
        }

        const transformedProvince = removeVietnameseAccents(capitalizeEachWord(cleanedString).toLowerCase().replace(/\s+/g, "-"));
        provinces[transformedProvince] = provinces[transformedProvince] ? provinces[transformedProvince] + 1 : 1;

        await doc.ref.update({ location: { province: transformedProvince } });
      }
    }
  }

  const entries = Object.entries(provinces);
  let row = "";
  entries.forEach((entry, index) => {
    (async () => {
      const chalk = await import("chalk");

      row += `${chalk.default.green(entry[0])}: ${chalk.default.yellow(entry[1])}  `;
      if ((index + 1) % 3 === 0 || index === entries.length - 1) {
        console.log(row.trim());
        row = "";
      }
    })();
  });
  console.log("Tổng số tỉnh:", Object.keys(provinces).length);
  console.log(
    "Tổng các DA trong tỉnh:",
    Object.values(provinces).reduce((acc, val) => acc + val, 0)
  );
}

function removeSpecificWords(str, words) {
  const regex = new RegExp(`\\b(${words.join("|")})\\b`, "gi");
  return str.replace(regex, "").trim();
}

function capitalizeEachWord(str) {
  return str
    .split(" ")
    .map((word, index, arr) => {
      if (word.includes("DA")) {
        return word.toUpperCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

function removeVietnameseAccents(str) {
  // Convert accented characters to their non-accented counterparts
  const map = {
    à: "a",
    á: "a",
    ả: "a",
    ã: "a",
    ạ: "a",
    ă: "a",
    ằ: "a",
    ắ: "a",
    ẳ: "a",
    ẵ: "a",
    ặ: "a",
    â: "a",
    ầ: "a",
    ấ: "a",
    ẩ: "a",
    ẫ: "a",
    ậ: "a",
    è: "e",
    é: "e",
    ẻ: "e",
    ẽ: "e",
    ẹ: "e",
    ê: "e",
    ề: "e",
    ế: "e",
    ể: "e",
    ễ: "e",
    ệ: "e",
    ì: "i",
    í: "i",
    ỉ: "i",
    ĩ: "i",
    ị: "i",
    ò: "o",
    ó: "o",
    ỏ: "o",
    õ: "o",
    ọ: "o",
    ô: "o",
    ồ: "o",
    ố: "o",
    ổ: "o",
    ỗ: "o",
    ộ: "o",
    ơ: "o",
    ờ: "o",
    ớ: "o",
    ở: "o",
    ỡ: "o",
    ợ: "o",
    ù: "u",
    ú: "u",
    ủ: "u",
    ũ: "u",
    ụ: "u",
    ư: "u",
    ừ: "u",
    ứ: "u",
    ử: "u",
    ữ: "u",
    ự: "u",
    ỳ: "y",
    ý: "y",
    ỷ: "y",
    ỹ: "y",
    ỵ: "y",
    đ: "d",
    À: "A",
    Á: "A",
    Ả: "A",
    Ã: "A",
    Ạ: "A",
    Ă: "A",
    Ằ: "A",
    Ắ: "A",
    Ẳ: "A",
    Ẵ: "A",
    Ặ: "A",
    Â: "A",
    Ầ: "A",
    Ấ: "A",
    Ẩ: "A",
    Ẫ: "A",
    Ậ: "A",
    È: "E",
    É: "E",
    Ẻ: "E",
    Ẽ: "E",
    Ẹ: "E",
    Ê: "E",
    Ề: "E",
    Ế: "E",
    Ể: "E",
    Ễ: "E",
    Ệ: "E",
    Ì: "I",
    Í: "I",
    Ỉ: "I",
    Ĩ: "I",
    Ị: "I",
    Ò: "O",
    Ó: "O",
    Ỏ: "O",
    Õ: "O",
    Ọ: "O",
    Ô: "O",
    Ồ: "O",
    Ố: "O",
    Ổ: "O",
    Ỗ: "O",
    Ộ: "O",
    Ơ: "O",
    Ờ: "O",
    Ớ: "O",
    Ở: "O",
    Ỡ: "O",
    Ợ: "O",
    Ù: "U",
    Ú: "U",
    Ủ: "U",
    Ũ: "U",
    Ụ: "U",
    Ư: "U",
    Ừ: "U",
    Ứ: "U",
    Ử: "U",
    Ữ: "U",
    Ự: "U",
    Ỳ: "Y",
    Ý: "Y",
    Ỷ: "Y",
    Ỹ: "Y",
    Ỵ: "Y",
    Đ: "D",
  };

  return str?.replace(/[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴĐ]/g, (matched) => map[matched]);
}

// updateSlugForAllDocuments(newsData).catch(console.error);
// moveDocument("du-an-2023", "du-an-2022", "14275").catch(console.error);
// extractProvincesFromName();

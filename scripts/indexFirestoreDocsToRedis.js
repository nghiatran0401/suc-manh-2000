const { firestore } = require("./firebase");
const { upsertDocumentToIndex, createSearchIndex } = require("../server/services/redis");

const Redis = require("ioredis");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

async function indexFirestoreDocsToRedis(env) {
  const redisEnv = new Redis(env === "prod" ? process.env.REDIS_PROD_URL : process.env.REDIS_LOCAL_URL);
  console.log(`Indexing Firestore data to Redis at ${env === "prod" ? process.env.REDIS_PROD_URL : process.env.REDIS_LOCAL_URL}`);

  try {
    await createSearchIndex(redisEnv);

    const collections = await firestore.listCollections();
    for (const collection of collections) {
      const snapshot = await collection.get();

      const promises = snapshot.docs.map(async (doc) => {
        const data = {
          ...doc.data(),
          collection_id: collection.id,
          doc_id: doc.id,
        };

        // Upsert document to search index
        await upsertDocumentToIndex(data, redisEnv);

        // Add item to sorted set
        await addItemToSortedSet(collection.id, data, redisEnv);
      });

      await Promise.all(promises);
      console.log(`Indexed ${snapshot.docs.length} documents from collection '${collection.id}'`);
    }

    redisEnv.disconnect();
  } catch (error) {
    console.error(`Error indexing Firestore data:`, error.message);
  }
}

const addItemToSortedSet = async (category, data, redisEnv) => {
  const item = {
    id: data.id,
    slug: data.slug,
    name: data.name,
    cleanedName: convertToCleanedName(data.name),
    publishDate: data.publish_date?.toDate(),
    thumbnail: data.thumbnail,
    category: data.category,
    classification: data.classification,
    status: data.status,
    totalFund: data.totalFund,
    province: data.location?.province,
    collection_id: data.collection_id,
    doc_id: data.doc_id,
  };

  const publishDate = item.publishDate ? new Date(item.publishDate).getTime() : 0;
  if (isNaN(publishDate)) {
    console.error(`Invalid publishDate for item with ID ${item.doc_id}`);
    return;
  }

  await redisEnv.zadd(`sorted_posts:${category}`, publishDate, JSON.stringify(item));
  console.log(`Added item with ID ${item.doc_id} to sorted set 'sorted_posts:${category}'`);
};

function convertToCleanedName(name) {
  const cleanedName = removeVietnameseAccents(name ?? "")
    ?.toLowerCase()
    ?.replace(/[^a-z0-9 ]/g, "");
  return cleanedName;
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

indexFirestoreDocsToRedis("local").catch(console.error);

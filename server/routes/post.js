const express = require("express");
const slugify = require("slugify");
const { firestore, firebase } = require("../firebase");
const { POSTS_PER_PAGE } = require("../constants");
const { upsertDocumentToIndex, removeDocumentFromIndex, getValueInRedis, setExValueInRedis } = require("../services/redis");
const { convertToDate, updateClassificationAndCategoryCounts } = require("../utils");

const CLASSIFICATIONS = ["truong-hoc", "nha-hanh-phuc", "khu-noi-tru", "cau-hanh-phuc", "wc", "loai-khac"];
const STATUSES = ["can-quyen-gop", "dang-xay-dung", "da-hoan-thanh"];

const postRouter = express.Router({ mergeParams: true });

// Get a list of posts
postRouter.get("/", async (req, res) => {
  const { _start, _end, filter, name_like } = req.query;
  const { category } = req.params;
  const isProject = category.includes("du-an") || category.includes("phong-tin-hoc");

  try {
    const postCollectionRef = firestore.collection(category);
    const categoryDoc = await firestore.collection("counts").doc("category").get();

    let totalCount = categoryDoc.data()[category];
    if (!totalCount) {
      totalCount = await postCollectionRef.get().then((snap) => snap.size);
    }

    let query = postCollectionRef.orderBy("publish_date", "desc");
    let totalFilterCount;

    if (filter && isProject && totalCount > POSTS_PER_PAGE) {
      const ALL = "all";

      if (filter.classificationFilter !== ALL) {
        query = query.where("classification", "==", filter.classificationFilter);
      } else {
        query = query.where("classification", "in", CLASSIFICATIONS);
      }

      if (filter.totalFundFilter !== ALL) {
        switch (filter.totalFundFilter) {
          case "less-than-100":
            query = query.where("totalFund", "<", 100000000);
            break;
          case "100-to-200":
            query = query.where("totalFund", ">=", 100000000).where("totalFund", "<", 200000000);
            break;
          case "200-to-300":
            query = query.where("totalFund", ">=", 200000000).where("totalFund", "<", 300000000);
            break;
          case "300-to-400":
            query = query.where("totalFund", ">=", 300000000).where("totalFund", "<", 400000000);
            break;
          case "more-than-400":
            query = query.where("totalFund", ">=", 400000000);
            break;
          default:
            break;
        }
      } else {
        query = query;
      }

      if (filter.statusFilter !== ALL) {
        query = query.where("status", "==", filter.statusFilter);
      } else {
        query = query.where("status", "in", STATUSES);
      }

      totalFilterCount = await query.get().then((snap) => snap.size);
    }

    if (_end !== undefined && !name_like) {
      query = query.offset(Number(_start)).limit(Number(_end - _start));
    }

    const postCollectionSnapshot = await query.get();

    const mapDocToData = (doc) => {
      const data = doc.data();
      data.publish_date = convertToDate(data.publish_date);
      data.start_date = convertToDate(data.start_date);
      data.end_date = convertToDate(data.end_date);

      return data;
    };

    let postCollectionData;
    if (name_like) {
      postCollectionData = postCollectionSnapshot.docs.filter((doc) => doc.data().name.toLowerCase().includes(name_like.toLowerCase())).map(mapDocToData);
    } else {
      postCollectionData = postCollectionSnapshot.docs.map(mapDocToData);
    }

    res.set({
      "X-Total-Count": totalCount?.toString(),
      "X-Total-Filter-Count": totalFilterCount?.toString() ?? "0",
      "Access-Control-Expose-Headers": "X-Total-Count, X-Total-Filter-Count",
    });
    res.status(200).send(postCollectionData);
  } catch (error) {
    res.status(404).send({ error: `Error getting all documents: ${error.message}` });
  }
});

// Get a list of 5 latest posts
postRouter.get("/getLatestPosts", async (req, res) => {
  const { category } = req.params;
  const cachedKey = `latestPosts:${category}`;

  try {
    const cachedResultData = await getValueInRedis(cachedKey);

    if (cachedResultData) {
      res.status(200).send(cachedResultData);
    } else {
      const postCollectionRef = firestore.collection(category);
      const query = postCollectionRef.orderBy("publish_date", "desc");
      const postCollectionSnapshot = await query.offset(0).limit(5).get();
      const postCollectionData = postCollectionSnapshot.docs.map((doc) => doc.data());
      const resultData = postCollectionData.map((post) => ({
        name: post.name,
        author: post.author,
        publish_date: post.publish_date.toDate(),
        slug: post.slug,
        image: post.content.tabs[0].slide_show[0]?.image ?? "https://www.contentviewspro.com/wp-content/uploads/2017/07/default_image.png",
      }));

      await setExValueInRedis(cachedKey, resultData);
      res.status(200).send(resultData);
    }
  } catch (error) {
    res.status(404).send({ error: `Error getting a list of 5 latest documents: ${error.message}` });
  }
});

postRouter.get("/stats", async (req, res) => {
  const { category } = req.params;

  try {
    const postCollectionRef = firestore.collection(category);
    const posts = (await postCollectionRef.get()).docs;

    const statsData = {};
    for (const post of posts) {
      const data = post.data();
      if (statsData[data.classification]) {
        statsData[data.classification].count += 1;
        statsData[data.classification][data.status] += 1;
      } else {
        statsData[data.classification] = {
          count: 1,
          [STATUSES[0]]: 0,
          [STATUSES[1]]: 0,
          [STATUSES[2]]: 0,
        };
        statsData[data.classification][data.status] += 1;
      }
    }

    res.set({ "X-Total-Count": posts.length.toString() }).status(200).json(statsData);
  } catch (error) {
    res.status(404).send({ error: `Error getting stats: ${error.message}` });
  }
});

// Get a post
postRouter.get("/:id", async (req, res) => {
  const { category, id } = req.params;

  try {
    const postDocRef = firestore.collection(category).where("slug", "==", id);
    const postDocRefSnapshot = await postDocRef.get();

    if (!postDocRefSnapshot.empty) {
      const postDocData = postDocRefSnapshot.docs[0].data();
      postDocData.publish_date = convertToDate(postDocData.publish_date);
      postDocData.start_date = convertToDate(postDocData.start_date);
      postDocData.end_date = convertToDate(postDocData.end_date);

      res.status(200).json(postDocData);
    } else {
      res.status(404).json({ error: "Post not found" });
    }
  } catch (error) {
    res.status(404).send({ error: `Error getting a document: ${error.message}` });
  }
});

// Create a post
postRouter.post("/", async (req, res) => {
  const { category } = req.params;
  const createdPost = req.body;
  const isProject = category.includes("du-an") || category.includes("phong-tin-hoc");

  const commonPostFields = {
    id: createdPost.id,
    name: createdPost.name,
    author: "Admin",
    publish_date: createdPost.publish_date ? firebase.firestore.Timestamp.fromDate(new Date(createdPost.publish_date)) : firebase.firestore.Timestamp.fromDate(new Date()),
    slug: slugify(createdPost.name, { lower: true, strict: true }),
    thumbnail: createdPost.thumbnail,
    category: createdPost.category,
    classification: createdPost.classification,
    status: createdPost.status,
    totalFund: Number(createdPost.totalFund) * 1000000 ?? 0,
  };
  const transformedProjectPost = {
    ...commonPostFields,
    description: createdPost.description ?? null,
    start_date: createdPost.start_date ? firebase.firestore.Timestamp.fromDate(new Date(createdPost.start_date)) : null,
    end_date: createdPost.end_date ? firebase.firestore.Timestamp.fromDate(new Date(createdPost.end_date)) : null,
    donor: {
      description: createdPost["donor.description"] ?? null,
      images: createdPost["donor.images"] ?? [],
    },
    progress: [
      {
        name: "Ảnh hiện trạng",
        images: createdPost["progress.images1"] ?? [],
      },
      {
        name: "Ảnh tiến độ",
        images: createdPost["progress.images2"] ?? [],
      },
      {
        name: "Ảnh hoàn thiện",
        images: createdPost["progress.images3"] ?? [],
      },
    ],
    content: {
      tabs: [
        {
          name: "Hoàn cảnh",
          description: createdPost["content.description1"] ?? null,
          slide_show: createdPost["content.images1"] ?? [],
        },
        {
          name: "Nhà hảo tâm",
          description: createdPost["content.description2"] ?? null,
          slide_show: createdPost["content.images2"] ?? [],
        },
        {
          name: "Mô hình xây",
          description: createdPost["content.description3"] ?? null,
          slide_show: createdPost["content.images3"] ?? [],
        },
      ],
    },
  };
  const transformedOriginalPost = {
    ...commonPostFields,
    content: {
      tabs: [
        {
          name: "Hoàn cảnh",
          description: createdPost["content.description1"] ?? "",
          slide_show: createdPost["content.images1"] ?? [],
        },
      ],
    },
  };

  const postToSave = isProject ? transformedProjectPost : transformedOriginalPost;

  try {
    // Create a new post doc in Firestore
    const postDocRef = firestore.collection(category).doc(postToSave.id);
    await postDocRef.set(postToSave);

    // Add the post to Redis search index
    await upsertDocumentToIndex({ 
      ...postToSave, 
      collection_id: category, 
      doc_id: postToSave.id, 
      year: postToSave.publish_date?.toDate()?.getFullYear(),
    });

    // Increase the count of the post's category and classification
    const resultData = await updateClassificationAndCategoryCounts(postToSave.classification, postToSave.category, +1);
    const cachedKey = `classificationAndCategoryCounts`;
    await setExValueInRedis(cachedKey, resultData);

    res.status(200).json(postToSave);
  } catch (error) {
    res.status(404).send({ error: `Error creating a document: ${error.message}` });
  }
});

// Edit a post
postRouter.patch("/:id", async (req, res) => {
  const { category, id } = req.params;
  const updatedPost = req.body;
  const isProject = category.includes("du-an") || category.includes("phong-tin-hoc");

  try {
    const querySnapshot = await firestore.collection(category).where("slug", "==", id).get();
    const docData = querySnapshot.docs[0].data();

    let postToSave;
    const commonPostFields = {
      id: updatedPost.id ?? docData.id,
      name: updatedPost.name ?? docData.name,
      author: docData.author,
      publish_date: updatedPost.publish_date ? firebase.firestore.Timestamp.fromDate(new Date(updatedPost.publish_date)) : docData.publish_date,
      slug: docData.slug,
      thumbnail: updatedPost.thumbnail ?? docData.thumbnail,
      category: updatedPost.category ?? docData.category,
      totalFund: Number(updatedPost.totalFund) * 1000000 ?? docData.totalFund ?? null,
      classification: updatedPost.classification ?? docData.classification ?? null,
      status: updatedPost.status ?? docData.status ?? null,
    };
    if (isProject) {
      postToSave = {
        ...commonPostFields,
        description: updatedPost.description ?? docData.description ?? null,
        totalFund: Number(updatedPost.totalFund) * 1000000 ?? docData.totalFund ?? null,
        classification: updatedPost.classification ?? docData.classification ?? null,
        status: updatedPost.status ?? docData.status ?? null,
        start_date: updatedPost.start_date ? firebase.firestore.Timestamp.fromDate(new Date(updatedPost.start_date)) : docData.start_date ?? null,
        end_date: updatedPost.end_date ? firebase.firestore.Timestamp.fromDate(new Date(updatedPost.end_date)) : docData.end_date ?? null,
        donor: {
          description: updatedPost["donor.description"] ?? docData.donor?.description ?? null,
          images: updatedPost["donor.images"] ?? docData.donor.images ?? null,
        },
        progress: [
          {
            name: "Ảnh hiện trạng",
            images: updatedPost["progress.images1"] ?? docData.progress.find((p) => p.name === "Ảnh hiện trạng")?.images ?? [],
          },
          {
            name: "Ảnh tiến độ",
            images: updatedPost["progress.images2"] ?? docData.progress.find((p) => p.name === "Ảnh tiến độ")?.images ?? [],
          },
          {
            name: "Ảnh hoàn thiện",
            images: updatedPost["progress.images3"] ?? docData.progress.find((p) => p.name === "Ảnh hoàn thiện")?.images ?? [],
          },
        ],
        content: {
          tabs: [
            {
              name: "Hoàn cảnh",
              description: updatedPost["content.description1"] ?? docData.content?.tabs?.find((t) => t.name === "Hoàn cảnh")?.description ?? null,
              slide_show: updatedPost["content.images1"] ?? docData.content?.tabs?.find((t) => t.name === "Hoàn cảnh")?.slide_show ?? [],
            },
            {
              name: "Nhà hảo tâm",
              description: updatedPost["content.description2"] ?? docData.content?.tabs?.find((t) => t.name === "Nhà hảo tâm")?.description ?? null,
              slide_show: updatedPost["content.images2"] ?? docData.content?.tabs?.find((t) => t.name === "Nhà hảo tâm")?.slide_show ?? [],
            },
            {
              name: "Mô hình xây",
              description: updatedPost["content.description3"] ?? docData.content?.tabs?.find((t) => t.name === "Mô hình xây")?.description ?? null,
              slide_show: updatedPost["content.images3"] ?? docData.content?.tabs?.find((t) => t.name === "Mô hình xây")?.slide_show ?? [],
            },
          ],
        },
      };
    } else {
      postToSave = {
        ...commonPostFields,
        content: {
          tabs: [
            {
              name: "Hoàn cảnh",
              description: updatedPost["content.description1"] ?? docData.content?.tabs?.find((t) => t.name === "Hoàn cảnh")?.description ?? null,
              slide_show: updatedPost["content.images1"] ?? docData.content?.tabs?.find((t) => t.name === "Hoàn cảnh")?.slide_show ?? [],
            },
          ],
        },
      };
    }

    if (!querySnapshot.empty) {
      // Update the post in Firestore
      const docRef = querySnapshot.docs[0].ref;
      await docRef.update(postToSave);

      // Update the post in Redis search index
      await upsertDocumentToIndex({ 
        ...postToSave, 
        collection_id: category, 
        doc_id: postToSave.id,
        year: postToSave.publish_date?.toDate()?.getFullYear(),
      });

      // Update the count of the post's classification if it has changed
      // Post's category currently is set to be unchangeable (due to the current Firestore DB data structure)
      if (isProject && postToSave.classification !== docData.classification) {
        const classificationDoc = await firestore.collection("counts").doc("classification").get();

        if (classificationDoc.exists) {
          const classificationCounts = classificationDoc.data();
          classificationCounts[postToSave.classification] = (classificationCounts[postToSave.classification] || 0) + 1;
          classificationCounts[docData.classification] = (classificationCounts[docData.classification] || 0) - 1;
          await firestore.collection("counts").doc("classification").set(classificationCounts);

          const cachedKey = `classificationAndCategoryCounts`;
          const cachedResultData = await getValueInRedis(cachedKey);
          const resultData = { classification: classificationCounts, category: cachedResultData.category };
          await setExValueInRedis(cachedKey, resultData);
        }
      }

      res.status(200).json(postToSave);
    }
  } catch (error) {
    res.status(500).send({ error: `Error updating a document: ${error.message}` });
  }
});

// Delete a post
postRouter.delete("/:id", async (req, res) => {
  const { category, id } = req.params;

  try {
    const querySnapshot = await firestore.collection(category).where("slug", "==", id).get();

    if (!querySnapshot.empty) {
      // Delete the post from Firestore
      const docRef = querySnapshot.docs[0].ref;
      await docRef.delete();

      // Remove the post from Redis search index
      await removeDocumentFromIndex({ collection_id: category, doc_id: querySnapshot.docs[0].id });

      // Decrease the count of the post's category and classification
      const docData = querySnapshot.docs[0].data();
      const resultData = await updateClassificationAndCategoryCounts(docData.classification, docData.category, -1);
      const cachedKey = `classificationAndCategoryCounts`;
      await setExValueInRedis(cachedKey, resultData);

      res.status(200).json({ message: "Post deleted successfully" });
    }
  } catch (error) {
    res.status(500).send({ error: `Error deleting a document: ${error.message}` });
  }
});

module.exports = postRouter;

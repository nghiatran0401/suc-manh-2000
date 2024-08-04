const express = require("express");
const slugify = require("slugify");
const { firestore, firebase } = require("../firebase");
const { upsertDocumentToIndex, removeDocumentFromIndex, getValueInRedis, setExValueInRedis, getValuesByCategoryInRedis } = require("../services/redis");
const { convertToDate, updateClassificationAndCategoryCounts } = require("../utils");

const postRouter = express.Router({ mergeParams: true });

postRouter.get("/", async (req, res) => {
  const { filters } = req.query;
  const { category } = req.params;

  try {
    const { cachedResultData, totalValuesLength, statsData } = await getValuesByCategoryInRedis(category, filters);

    if (cachedResultData) {
      // why res.set ? admin uses it
      res
        .set({
          "X-Total-Count": totalValuesLength.toString(),
          "Access-Control-Expose-Headers": "X-Total-Count",
        })
        .status(200)
        .send({ posts: cachedResultData, stats: statsData });
    } else {
      res.status(404).send({ error: `Error getting all documents in Redis` });
    }

    // monitor this and/or create a script to index all data to Redis
    // else {
    //   const postCollectionRef = firestore.collection(category);
    //   const categoryDoc = await firestore.collection("counts").doc("category").get();

    //   let totalCount = categoryDoc.data()[category];
    //   if (!totalCount) {
    //     totalCount = await postCollectionRef.get().then((snap) => snap.size);
    //   }

    //   let query = postCollectionRef.orderBy("publish_date", "desc");
    //   let totalFilterCount;

    //   if (filters && isProject && totalCount > POSTS_PER_PAGE) {
    //     const ALL = "all";

    //     if (filters.classificationFilter !== ALL) {
    //       query = query.where("classification", "==", filters.classificationFilter);
    //     }

    //     if (filters.totalFundFilter !== ALL) {
    //       switch (filters.totalFundFilter) {
    //         case "less-than-100":
    //           query = query.where("totalFund", "<", 100000000);
    //           break;
    //         case "100-to-200":
    //           query = query.where("totalFund", ">=", 100000000).where("totalFund", "<", 200000000);
    //           break;
    //         case "200-to-300":
    //           query = query.where("totalFund", ">=", 200000000).where("totalFund", "<", 300000000);
    //           break;
    //         case "300-to-400":
    //           query = query.where("totalFund", ">=", 300000000).where("totalFund", "<", 400000000);
    //           break;
    //         case "more-than-400":
    //           query = query.where("totalFund", ">=", 400000000);
    //           break;
    //         default:
    //           break;
    //       }
    //     }

    //     if (filters.statusFilter !== ALL) {
    //       query = query.where("status", "==", filter.statusFilter);
    //     }

    //     // if (filter.provinceFilter !== ALL) {
    //     //   query = query.where("location.province", "==", filter.provinceFilter);
    //     // }

    //     totalFilterCount = await query.get().then((snap) => snap.size);
    //   }

    //   console.log("totalFilterCount", totalFilterCount);
    //   if (_end !== undefined && !name_like) {
    //     query = query.offset(Number(_start)).limit(Number(_end - _start));
    //   }

    //   const postCollectionSnapshot = await query.get();

    //   const mapDocToData = (doc) => {
    //     const data = doc.data();
    // data.publish_date = convertToDate(data.publish_date);
    //     data.start_date = convertToDate(data.start_date);
    //     data.end_date = convertToDate(data.end_date);

    //     return data;
    //   };

    //   let postCollectionData;
    //   if (name_like) {
    //     postCollectionData = postCollectionSnapshot.docs.filter((doc) => doc.data().name.toLowerCase().includes(name_like.toLowerCase())).map(mapDocToData);
    //   } else {
    //     postCollectionData = postCollectionSnapshot.docs.map(mapDocToData);
    //   }

    //   res.set({
    //     "X-Total-Count": totalCount?.toString(),
    //     "Access-Control-Expose-Headers": "X-Total-Count",
    //   });
    //   res.status(200).send(postCollectionData);
    // }
  } catch (error) {
    res.status(404).send({ error: `Error getting all documents: ${error.message}` });
  }
});

// Combine with get obove
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
        publish_date: post.publish_date.toDate(),
        slug: post.slug,
        image: post.content.tabs[0].slide_show[0]?.image,
      }));

      await setExValueInRedis(cachedKey, resultData);
      res.status(200).send(resultData);
    }
  } catch (error) {
    res.status(404).send({ error: `Error getting a list of 5 latest documents: ${error.message}` });
  }
});

postRouter.get("/:id", async (req, res) => {
  const { category, id } = req.params;
  const cachedKey = `post:${category}:${id}`;

  try {
    const cachedResultData = await getValueInRedis(cachedKey);

    if (cachedResultData) {
      res.status(200).send(cachedResultData);
    } else {
      const postDocRef = firestore.collection(category).where("slug", "==", id);
      const postDocRefSnapshot = await postDocRef.get();

      if (postDocRefSnapshot.empty) {
        res.status(404).json({ error: "Post not found" });
      }

      const postDocData = postDocRefSnapshot.docs[0].data();
      postDocData.publish_date = convertToDate(postDocData.publish_date);
      postDocData.start_date = convertToDate(postDocData.start_date);
      postDocData.end_date = convertToDate(postDocData.end_date);

      res.status(200).json(postDocData);
    }
  } catch (error) {
    res.status(404).send({ error: `Error getting a document: ${error.message}` });
  }
});

postRouter.post("/", async (req, res) => {
  const { category } = req.params;
  const createdPost = req.body;
  const isProject = category.includes("du-an");

  const commonPostFields = {
    id: createdPost.id,
    name: createdPost.name,
    author: "Admin",
    publish_date: createdPost.publish_date ? firebase.firestore.Timestamp.fromDate(new Date(createdPost.publish_date)) : firebase.firestore.Timestamp.fromDate(new Date()),
    slug: slugify(createdPost.name, { lower: true, strict: true }),
    thumbnail: createdPost.thumbnail,
    category: createdPost.category,
  };
  const transformedProjectPost = {
    ...commonPostFields,
    description: createdPost.description ?? null,
    classification: createdPost.classification ?? null,
    status: createdPost.status ?? null,
    totalFund: Number(createdPost.totalFund) * 1000000 ?? null,
    location: {
      province: createdPost["location.province"] ?? null,
    },
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
    // Create a new post doc (in Firestore and Redis)
    const postDocRef = firestore.collection(category).doc(postToSave.id);
    await postDocRef.set(postToSave);
    await upsertDocumentToIndex({
      ...postToSave,
      collection_id: category,
      doc_id: postToSave.id,
    });

    // Increase the count of the post's category and classification (in Firestore and Redis)
    const resultData = await updateClassificationAndCategoryCounts(postToSave.classification, postToSave.category, +1);
    await setExValueInRedis(`classificationAndCategoryCounts`, resultData);

    res.status(200).json(postToSave);
  } catch (error) {
    res.status(404).send({ error: `Error creating a document: ${error.message}` });
  }
});

postRouter.patch("/:id", async (req, res) => {
  const { category, id } = req.params;
  const updatedPost = req.body;
  const isProject = category.includes("du-an");

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
    };
    if (isProject) {
      postToSave = {
        ...commonPostFields,
        description: updatedPost.description ?? docData.description ?? null,
        classification: updatedPost.classification ?? docData.classification ?? null,
        status: updatedPost.status ?? docData.status ?? null,
        totalFund: Number(updatedPost.totalFund) * 1000000 ?? docData.totalFund ?? null,
        location: {
          province: updatedPost["location.province"] ?? docData.location?.province ?? null,
        },
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

    if (querySnapshot.empty) {
      res.status(500).send({ error: `There's no document with id: ${id}` });
    }

    // Update the post (in Firestore and Redis)
    const docRef = querySnapshot.docs[0].ref;
    await docRef.update(postToSave);
    await upsertDocumentToIndex({
      ...postToSave,
      collection_id: category,
      doc_id: postToSave.id,
    });

    // Update the count of the post's classification if it has changed (in Firestore and Redis)
    // Post's category currently is set to be unchangeable (due to current Firestore DB data structure)
    if (isProject && postToSave.classification !== docData.classification) {
      const classificationDoc = await firestore.collection("counts").doc("classification").get();

      if (classificationDoc.exists) {
        const classificationCounts = classificationDoc.data();
        classificationCounts[postToSave.classification] = (classificationCounts[postToSave.classification] || 0) + 1;
        classificationCounts[docData.classification] = (classificationCounts[docData.classification] || 0) - 1;
        await firestore.collection("counts").doc("classification").set(classificationCounts);

        const cachedResultData = await getValueInRedis(cachedKey);
        const resultData = { classification: classificationCounts, category: cachedResultData.category };
        await setExValueInRedis(`classificationAndCategoryCounts`, resultData);
      }
    }

    res.status(200).json(postToSave);
  } catch (error) {
    res.status(500).send({ error: `Error updating a document: ${error.message}` });
  }
});

postRouter.delete("/:id", async (req, res) => {
  const { category, id } = req.params;

  try {
    const querySnapshot = await firestore.collection(category).where("slug", "==", id).get();

    if (querySnapshot.empty) {
      res.status(500).send({ error: `There's no document with id: ${id}` });
    }

    // Delete the post (in Firestore and Redis)
    const docRef = querySnapshot.docs[0].ref;
    await docRef.delete();
    await removeDocumentFromIndex({ collection_id: category, doc_id: querySnapshot.docs[0].id });

    // Decrease the count of the post's category and classification (in Firestore and Redis)
    const docData = querySnapshot.docs[0].data();
    const resultData = await updateClassificationAndCategoryCounts(docData.classification, docData.category, -1);
    await setExValueInRedis(`classificationAndCategoryCounts`, resultData);

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).send({ error: `Error deleting a document: ${error.message}` });
  }
});

module.exports = postRouter;

const express = require("express");
const slugify = require("slugify");
const { firestore, firebase } = require("../firebase");

const postRouter = express.Router({ mergeParams: true });

// Get a list of posts
postRouter.get("/", async (req, res) => {
  const { _start, _end } = req.query;
  const { category } = req.params;

  try {
    const postCollectionRef = firestore.collection(category);
    const categoryDoc = await firestore.collection("counts").doc("category").get();

    let totalCount = categoryDoc.data()[category];
    if (!totalCount) {
      totalCount = await postCollectionRef.get().then((snap) => snap.size);
    }

    const query = postCollectionRef.orderBy("publish_date", "desc");
    const postCollectionSnapshot = await query
      .offset(Number(_start))
      .limit(Number(_end - _start))
      .get();

    const postCollectionData = postCollectionSnapshot.docs.map((doc) => {
      const data = doc.data();
      if (data.publish_date) {
        data.publish_date = data.publish_date.toDate();
      }
      return data;
    });

    if (postCollectionData.length > 0) {
      res.set({ "X-Total-Count": totalCount.toString(), "Access-Control-Expose-Headers": "X-Total-Count" });
      res.status(200).send(postCollectionData);
    } else {
      res.status(404).send({ error: "No posts found for this page" });
    }
  } catch (error) {
    res.status(404).send({ error: `Error getting all documents: ${error.message}` });
  }
});

// Create a post
postRouter.post("/", async (req, res) => {
  const { category } = req.params;
  const createdPost = req.body;
  const transformedPost = {
    id: createdPost.id,
    name: createdPost.name,
    author: "Admin",
    publish_date: firebase.firestore.Timestamp.fromDate(new Date()),
    slug: slugify(createdPost.name, { lower: true, strict: true }),
    description: createdPost.description,
    category: createdPost.category,
    classification: createdPost.classification,
    donor: {
      description: createdPost["donor.description"] ?? "",
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
          description: createdPost["content.description1"] ?? "",
          slide_show: createdPost["content.images1"] ?? [],
        },
        {
          name: "Nhà hảo tâm",
          description: createdPost["content.description2"] ?? "",
          slide_show: createdPost["content.images2"] ?? [],
        },
        {
          name: "Mô hình xây",
          description: createdPost["content.description3"] ?? "",
          slide_show: createdPost["content.images3"] ?? [],
        },
      ],
    },
  };

  try {
    const postDocRef = firestore.collection(category).doc();
    await postDocRef.set(transformedPost);
    res.status(200).json({ message: "Post created successfully" });
  } catch (error) {
    res.status(404).send({ error: `Error creating a document: ${error.message}` });
  }
});

// Get a list of 5 latest posts
postRouter.get("/getLatestPosts", async (req, res) => {
  const { category } = req.params;

  try {
    const postCollectionRef = firestore.collection(category);
    const query = postCollectionRef.orderBy("publish_date", "desc");
    const postCollectionSnapshot = await query.offset(0).limit(5).get();
    const postCollectionData = postCollectionSnapshot.docs.map((doc) => doc.data());
    const latestPosts = postCollectionData.map((post) => ({
      name: post.name,
      author: post.author,
      publish_date: post.publish_date.toDate(),
      slug: post.slug,
      image: post.content.tabs[0].slide_show[0]?.image ?? "https://www.contentviewspro.com/wp-content/uploads/2017/07/default_image.png",
    }));

    if (latestPosts.length > 0) {
      res.status(200).send({ data: latestPosts });
    } else {
      res.status(404).send({ error: "No posts found for this page" });
    }
  } catch (error) {
    res.status(404).send({ error: `Error getting a list of latest documents: ${error.message}` });
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
      if (postDocData.publish_date) {
        postDocData.publish_date = postDocData.publish_date.toDate();
      }

      res.status(200).json(postDocData);
    } else {
      res.status(404).json({ error: "Post not found" });
    }
  } catch (error) {
    res.status(404).send({ error: `Error getting a document: ${error.message}` });
  }
});

// Edit a post
postRouter.patch("/:id", async (req, res) => {
  const { category, id } = req.params;
  const updatedPost = req.body;

  try {
    const querySnapshot = await firestore.collection(category).where("slug", "==", id).get();

    if (!querySnapshot.empty) {
      const docRef = querySnapshot.docs[0].ref;
      const docData = querySnapshot.docs[0].data();

      const mergedData = {
        name: updatedPost.name,
        description: updatedPost.description,
        category: updatedPost.category,
        classification: updatedPost.classification,
        donor: {
          description: updatedPost["donor.description"],
          images: updatedPost["donor.images"] ?? docData.donor.images,
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
              description: updatedPost["content.description1"] ?? docData.content?.tabs?.find((t) => t.name === "Hoàn cảnh")?.description ?? "",
              slide_show: updatedPost["content.images1"] ?? docData.content?.tabs?.find((t) => t.name === "Hoàn cảnh")?.slide_show ?? [],
            },
            {
              name: "Nhà hảo tâm",
              description: updatedPost["content.description2"] ?? docData.content?.tabs?.find((t) => t.name === "Nhà hảo tâm")?.description ?? "",
              slide_show: updatedPost["content.images2"] ?? docData.content?.tabs?.find((t) => t.name === "Nhà hảo tâm")?.slide_show ?? [],
            },
            {
              name: "Mô hình xây",
              description: updatedPost["content.description3"] ?? docData.content?.tabs?.find((t) => t.name === "Mô hình xây")?.description ?? "",
              slide_show: updatedPost["content.images3"] ?? docData.content?.tabs?.find((t) => t.name === "Mô hình xây")?.slide_show ?? [],
            },
          ],
        },
      };

      await docRef.update(mergedData);
      res.status(200).json({ message: "Post updated successfully" });
    } else {
      res.status(404).send({ error: "No document found" });
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
      const docRef = querySnapshot.docs[0].ref;
      await docRef.delete();
      res.status(200).json({ message: "Post deleted successfully" });
    } else {
      res.status(404).send({ error: "No document found" });
    }
  } catch (error) {
    res.status(500).send({ error: `Error deleting a document: ${error.message}` });
  }
});

module.exports = postRouter;

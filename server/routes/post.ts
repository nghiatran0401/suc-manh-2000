import express from "express";
import slugify from "slugify";
import { formatDate, updateClassificationAndCategoryCounts } from "../utils/index";
import { NewsPost, ProjectPost } from "./../../index.d";
import { Request, Response } from "express";
import { firestore, firebase } from "../firebase";
import { upsertDocumentToIndex, removeDocumentFromIndex, getValuesByCategoryInRedis } from "../services/redis";
import { v4 as uuidv4 } from "uuid";

const postRouter = express.Router({ mergeParams: true });

postRouter.get("/", async (req: Request, res: Response) => {
  const { filters, start, end, sortField } = req.query;
  const { category } = req.params;

  try {
    const { cachedResultData, totalValuesLength, statsData, provinceCount } = await getValuesByCategoryInRedis(category, filters, start, end, sortField);

    res.status(200).send({ posts: cachedResultData, totalPosts: totalValuesLength, stats: statsData, provinceCount });
  } catch (error: any) {
    res.status(404).send({ error: `Error getting all documents: ${error.message}` });
  }
});

postRouter.get("/:id", async (req: Request, res: Response) => {
  const { category, id } = req.params;

  try {
    const postDocRef = firestore.collection(category).where("slug", "==", id);
    const postDocRefSnapshot = await postDocRef.get();
    if (postDocRefSnapshot.empty) res.status(404).json({ error: "Post not found" });

    const postDocData = postDocRefSnapshot.docs[0].data();
    postDocData.createdAt = postDocData.createdAt?.toDate();

    res.status(200).json(postDocData);
  } catch (error: any) {
    res.status(404).send({ error: `Error getting a document: ${error.message}` });
  }
});

postRouter.post("/", async (req: Request, res: Response) => {
  const { category } = req.params;
  const createdPost = req.body;
  const isProject = category.includes("du-an");
  const newId = uuidv4().replace(/-/g, "").substring(0, 20);
  const projectId = createdPost.name.split(" - ") ? createdPost.name.split(" - ")[0] : "";

  const projectPost: ProjectPost = {
    id: newId,
    projectId: projectId,
    name: createdPost.name,
    author: "Admin",
    slug: slugify(projectId, { lower: true, strict: true }),
    createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
    updatedAt: firebase.firestore.Timestamp.fromDate(new Date()),
    thumbnail: createdPost.thumbnail,
    category: createdPost.category,
    classification: createdPost.classification ?? null,
    status: createdPost.status ?? null,
    totalFund: Number(createdPost.totalFund) * 1000000,
    location: {
      province: createdPost.province ?? null,
    },
    description: createdPost.description ?? null,
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
        // {
        //   name: "Mô hình xây",
        //   description: createdPost["content.description3"] ?? null,
        //   slide_show: createdPost["content.images3"] ?? [],
        // },
      ],
    },
  };
  const newsPost: NewsPost = {
    id: newId,
    name: createdPost.name,
    author: "Admin",
    slug: slugify(formatDate(new Date()), { lower: true, strict: true }),
    createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
    updatedAt: firebase.firestore.Timestamp.fromDate(new Date()),
    thumbnail: createdPost.thumbnail,
    category: createdPost.category,
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

  const postToSave = isProject ? projectPost : newsPost;

  try {
    // Create a new post doc (in Firestore and Redis)
    const postDocRef = firestore.collection(category).doc(postToSave.id);
    await postDocRef.set(postToSave);
    await upsertDocumentToIndex({ ...postToSave, collection_id: category, doc_id: postToSave.id });

    // Increase the count of the post's category and classification (in Firestore)
    await updateClassificationAndCategoryCounts((postToSave as any).classification, postToSave.category, +1);

    res.status(200).send(postToSave);
  } catch (error: any) {
    res.status(404).send({ error: `Error creating a document: ${error.message}` });
  }
});

postRouter.patch("/:id", async (req: Request, res: Response) => {
  const { category, id } = req.params;
  const updatedPost = req.body;
  const isProject = category.includes("du-an");

  try {
    const querySnapshot = await firestore.collection(category).where("slug", "==", id).get();
    const docData = querySnapshot.docs[0].data();
    const projectId = updatedPost.name.split(" - ") ? updatedPost.name.split(" - ")[0] : "";

    let postToSave: ProjectPost | NewsPost;
    if (isProject) {
      postToSave = {
        id: updatedPost.id ?? docData.id,
        projectId: projectId,
        name: updatedPost.name ?? docData.name,
        author: updatedPost.author ?? docData.author,
        slug: docData.slug,
        createdAt: docData.createdAt,
        updatedAt: firebase.firestore.Timestamp.fromDate(new Date()),
        thumbnail: updatedPost.thumbnail ?? docData.thumbnail,
        category: updatedPost.category ?? docData.category,
        description: updatedPost.description ?? docData.description ?? null,
        classification: updatedPost.classification ?? docData.classification ?? null,
        status: updatedPost.status ?? docData.status ?? null,
        totalFund: Number(updatedPost.totalFund) * 1000000,
        location: {
          province: updatedPost.province ?? docData.location?.province,
        },
        donor: {
          description: updatedPost["donor.description"] ?? docData.donor?.description ?? null,
          images: updatedPost["donor.images"] ?? docData.donor?.images ?? null,
        },
        progress: [
          {
            name: "Ảnh hiện trạng",
            images: updatedPost["progress.images1"] ?? docData.progress?.find((p: any) => p.name === "Ảnh hiện trạng")?.images ?? [],
          },
          {
            name: "Ảnh tiến độ",
            images: updatedPost["progress.images2"] ?? docData.progress?.find((p: any) => p.name === "Ảnh tiến độ")?.images ?? [],
          },
          {
            name: "Ảnh hoàn thiện",
            images: updatedPost["progress.images3"] ?? docData.progress?.find((p: any) => p.name === "Ảnh hoàn thiện")?.images ?? [],
          },
        ],
        progressNew: [
          {
            name: "Ảnh hiện trạng",
            images: updatedPost["progressNew.images1"] ?? docData.progressNew?.find((p: any) => p.name === "Ảnh hiện trạng")?.images ?? [],
          },
          {
            name: "Ảnh tiến độ",
            images: updatedPost["progressNew.images2"] ?? docData.progressNew?.find((p: any) => p.name === "Ảnh tiến độ")?.images ?? [],
          },
          {
            name: "Ảnh hoàn thiện",
            images: updatedPost["progressNew.images3"] ?? docData.progressNew?.find((p: any) => p.name === "Ảnh hoàn thiện")?.images ?? [],
          },
        ],
        content: {
          tabs: [
            {
              name: "Hoàn cảnh",
              description: updatedPost["content.description1"] ?? docData.content?.tabs?.find((t: any) => t.name === "Hoàn cảnh")?.description ?? null,
              slide_show: updatedPost["content.images1"] ?? docData.content?.tabs?.find((t: any) => t.name === "Hoàn cảnh")?.slide_show ?? [],
            },
            {
              name: "Nhà hảo tâm",
              description: updatedPost["content.description2"] ?? docData.content?.tabs?.find((t: any) => t.name === "Nhà hảo tâm")?.description ?? null,
              slide_show: updatedPost["content.images2"] ?? docData.content?.tabs?.find((t: any) => t.name === "Nhà hảo tâm")?.slide_show ?? [],
            },
            // {
            //   name: "Mô hình xây",
            //   description: updatedPost["content.description3"] ?? docData.content?.tabs?.find((t: any) => t.name === "Mô hình xây")?.description ?? null,
            //   slide_show: updatedPost["content.images3"] ?? docData.content?.tabs?.find((t: any) => t.name === "Mô hình xây")?.slide_show ?? [],
            // },
          ],
        },
      };
    } else {
      postToSave = {
        id: updatedPost.id ?? docData.id,
        name: updatedPost.name ?? docData.name,
        author: updatedPost.author ?? docData.author,
        slug: docData.slug,
        createdAt: docData.createdAt,
        updatedAt: firebase.firestore.Timestamp.fromDate(new Date()),
        thumbnail: updatedPost.thumbnail ?? docData.thumbnail,
        category: updatedPost.category ?? docData.category,
        content: {
          tabs: [
            {
              name: "Hoàn cảnh",
              description: updatedPost["content.description1"] ?? docData.content?.tabs?.find((t: any) => t.name === "Hoàn cảnh")?.description ?? null,
              slide_show: updatedPost["content.images1"] ?? docData.content?.tabs?.find((t: any) => t.name === "Hoàn cảnh")?.slide_show ?? [],
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
    await Promise.all([docRef.update(postToSave), upsertDocumentToIndex({ ...postToSave, collection_id: category, doc_id: postToSave.id })]);

    // Update the count of the post's classification if it has changed (in Firestore)
    // Post's category currently is set to be unchangeable (due to current Firestore DB data structure)
    if (isProject && (postToSave as any).classification !== docData.classification) {
      Promise.all([updateClassificationAndCategoryCounts((postToSave as any).classification, undefined, +1), updateClassificationAndCategoryCounts(docData.classification, undefined, -1)]);
    }

    res.status(200).send(postToSave);
  } catch (error: any) {
    res.status(500).send({ error: `Error updating a document: ${error.message}` });
  }
});

postRouter.delete("/:id", async (req: Request, res: Response) => {
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
    await updateClassificationAndCategoryCounts(docData.classification, docData.category, -1);

    res.status(200).send({ message: "Post deleted successfully" });
  } catch (error: any) {
    res.status(500).send({ error: `Error deleting a document: ${error.message}` });
  }
});

export default postRouter;
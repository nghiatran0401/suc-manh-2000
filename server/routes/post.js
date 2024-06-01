const express = require("express");
const { firestore } = require("../firebase");

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

// Get a single detailed post
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

// export const getProjectBySlug = async (req: Request, res: Response) => {
//   try {
//     const projectId = req.params.slug;
//     const docRef = firestore.collection(FirebaseCollections.PROJECTS).doc(projectId);
//     const snapshot = await docRef.get();

//     if (snapshot.exists) {
//       const project = snapshot.data() as Sucmanh2000.Project;
//       res.status(200).json(project);
//     } else {
//       res.status(404).json({ message: "Project not found" });
//     }
//   } catch (e: any) {
//     res.status(500).json(e);
//   }
// };

// export const addNewProject = async (req: Request, res: Response) => {
//   try {
//     const newProject = req.body as Sucmanh2000.Project;
//     const docRef = firestore.collection(FirebaseCollections.PROJECTS).doc();
//     await docRef.set({ ...newProject, createdAt: Date.now() });
//     res.status(200).json({ ...newProject, createdAt: Date.now() });
//   } catch (e: any) {
//     res.status(500).json(e);
//   }
// };

// export const updateProjectById = async (req: Request, res: Response) => {
//   try {
//     const projectId = req.params.id;
//     const updatedProject = req.body;
//     const docRef = firestore.collection(FirebaseCollections.PROJECTS).doc(projectId);
//     await docRef.update(updatedProject);

//     res.status(200).json({ message: "Project updated successfully" });
//   } catch (e: any) {
//     res.status(500).json(e);
//   }
// };

// export const removeProjectById = async (req: Request, res: Response) => {
//   try {
//     const projectId = req.params.id;
//     const docRef = firestore.collection(FirebaseCollections.PROJECTS).doc(projectId);
//     await docRef.delete();
//     res.status(200).json({ message: "Project deleted successfully" });
//   } catch (e: any) {
//     console.log(e);
//     res.status(500).json(e);
//   }
// };

module.exports = postRouter;

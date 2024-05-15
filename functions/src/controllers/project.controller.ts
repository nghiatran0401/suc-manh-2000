import { Response, Request } from "express";
import { firestore } from "../firebase";
import { FirebaseCollections } from "../constant";
export const getProjectstList = async (req: Request, res: Response) => {
  try {
    const projectsRef = firestore.collection(FirebaseCollections.PROJECTS);
    let projectsQuery;

    const category = req.query.category as string;
    if (category && category !== "tat-ca") {
      projectsQuery = projectsRef.where("category", "==", category);
    }

    const projectsSnapshot = await (projectsQuery ?? projectsRef)
      .orderBy('createdAt')
      .get();

    const projects = projectsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const totalCount = (
      (await (projectsQuery ?? projectsRef).get()) ?? { size: 0 }
    ).size;
    res.set({
      "x-total-count": totalCount.toString(),
      "Access-Control-Expose-Headers": "x-total-count",
    });

    res.status(200).json(projects);
  } catch (ee: any) {
    console.log(ee);
    res.status(500).json(ee);
  }
};

export const getProjectById = async (req: Request, res: Response) => {
  try {
    const projectId = req.params.id;
    const docRef = firestore
      .collection(FirebaseCollections.PROJECTS)
      .doc(projectId);
    const snapshot = await docRef.get();

    if (snapshot.exists) {
      const project = snapshot.data() as Sucmanh2000.Project;
      res.status(200).json(project);
    } else {
      res.status(404).json({ message: "Project not found" });
    }
  } catch (e: any) {
    res.status(500).json(e);
  }
};


export const getProjectBySlug = async (req: Request, res: Response) => {
  try {
    const projectId = req.params.slug;
    const docRef = firestore
      .collection(FirebaseCollections.PROJECTS)
      .doc(projectId);
    const snapshot = await docRef.get();

    if (snapshot.exists) {
      const project = snapshot.data() as Sucmanh2000.Project;
      res.status(200).json(project);
    } else {
      res.status(404).json({ message: "Project not found" });
    }
  } catch (e: any) {
    res.status(500).json(e);
  }
};

export const addNewProject = async (req: Request, res: Response) => {
  try {
    const newProject = req.body as Sucmanh2000.Project;
    const docRef = firestore
      .collection(FirebaseCollections.PROJECTS)
      .doc();
    await docRef.set({ ...newProject, createdAt: Date.now() });
    res.status(200).json({ ...newProject, createdAt: Date.now() });
  } catch (e: any) {
    res.status(500).json(e);
  }
};

export const updateProjectById = async (req: Request, res: Response) => {
  try {
    const projectId = req.params.id;
    const updatedProject = req.body;
    const docRef = firestore
      .collection(FirebaseCollections.PROJECTS)
      .doc(projectId);
    await docRef.update(updatedProject);

    res.status(200).json({ message: "Project updated successfully" });
  } catch (e: any) {
    res.status(500).json(e);
  }
};

export const removeProjectById = async (req: Request, res: Response) => {
  try {
    const projectId = req.params.id;
    const docRef = firestore
      .collection(FirebaseCollections.PROJECTS)
      .doc(projectId);
    await docRef.delete();
    res.status(200).json({ message: "Project deleted successfully" });
  } catch (e: any) {
    console.log(e);
    res.status(500).json(e);
  }
};

import * as express from "express";
const projectRouter = express.Router();
import { AuthMiddleware } from "../middleware/auth";
import {
  addNewProject,
  getProjectById,
  getProjectstList,
  removeProjectById,
  updateProjectById,
} from "../controllers/project.controller";

projectRouter.get("/", getProjectstList);
projectRouter.post("/", AuthMiddleware, addNewProject);
projectRouter.get("/:id", getProjectById);
projectRouter.patch("/:id", AuthMiddleware, updateProjectById);
projectRouter.delete("/:id", AuthMiddleware, removeProjectById);

export default projectRouter;

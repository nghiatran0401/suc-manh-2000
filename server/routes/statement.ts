import express from "express";
import { Request, Response } from "express";
import pool from "../services/postgres";

const statementRouter = express.Router();

statementRouter.get("/", async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM statement ORDER BY date DESC");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error returning data from database.");
  }
});

export default statementRouter;

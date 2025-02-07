import express from "express";
import { Request, Response } from "express";
require("dotenv").config();
import pool from "../services/db";

const statementRouter = express.Router();

statementRouter.get("/", async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM statement");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching data");
  }
});

export default statementRouter;

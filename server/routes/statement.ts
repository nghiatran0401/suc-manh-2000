import express from "express";
import { Request, Response } from "express";
require("dotenv").config();
const { Pool } = require("pg");

const statementRouter = express.Router();

statementRouter.get("/", async (req: Request, res: Response) => {
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    const result = await pool.query("SELECT * FROM statement");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching data");
  }
});

export default statementRouter;

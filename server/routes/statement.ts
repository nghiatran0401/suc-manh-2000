import express from "express";
import { Request, Response } from "express";
import pool from "../services/postgres";
import { formatDate } from "../utils";
import { getValueInRedis, setExValueInRedis } from "../services/redis";

const statementRouter = express.Router();

statementRouter.get("/", async (req: Request, res: Response) => {
  try {
    const { search, month, year, bank, page, limit } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10)) || 1;
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10))) || 50;
    const offset = (pageNum - 1) * limitNum;

    let whereClauses: string[] = [];
    let values: any[] = [];

    if (search) {
      whereClauses.push(`
        to_tsvector('english', transaction_code || ' ' || description || ' ' || project) @@ plainto_tsquery($1)
      `);
      values.push(search);
    }

    if (month && year) {
      const monthYear = `${month}.${year}`;
      whereClauses.push(`month_sheet = $${values.length + 1}`);
      values.push(monthYear);
    }

    if (bank) {
      whereClauses.push(`construction_unit = $${values.length + 1}`);
      values.push(bank);
    }

    const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";

    // Safe sorting: Only allow sorting by indexed columns
    const query = `
      SELECT * FROM statement
      ${whereSql}
      ORDER BY date DESC
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}
    `;
    values.push(limitNum, offset);

    // Execute query
    const data = await pool.query(query, values);
    const formattedData = data.rows.map((row) => ({
      ...row,
      date: formatDate(row.date),
      amount: row.amount ? parseFloat(row.amount).toLocaleString() : "0",
    }));

    // TODO: caching capital sum in months, years if necessary

    // Get total capital sum from redis
    let capitalSum;
    const calculateTotalAmount = (rows: any[]): number => {
      return rows.reduce((total, row) => {
        const numeric = parseFloat(row.amount?.toString().replace(/[^\d.-]/g, "") || "0");
        return total + (isNaN(numeric) ? 0 : numeric);
      }, 0);
    };

    const cachedKey = `statementCapitalSum`;
    const cachedResultData = await getValueInRedis(cachedKey);
    if (cachedResultData) {
      capitalSum = parseFloat(cachedResultData);
    } else {
      const result = await pool.query("SELECT amount FROM statement");
      const total = calculateTotalAmount(result.rows);
      capitalSum = total;
      await setExValueInRedis(cachedKey, total, true);
    }

    res.json({ data: formattedData, capitalSum: capitalSum });
  } catch (error: any) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Error retrieving data from the database." });
  }
});

export default statementRouter;

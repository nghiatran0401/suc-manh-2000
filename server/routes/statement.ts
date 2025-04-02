import express from "express";
import { Request, Response } from "express";
import moment from "moment";
import { formatDate } from "../utils";
import { firestore } from "../firebase";
import { initializeGoogleSheets } from "../services/google";
import csv from "csv-parser";
import fs from "fs";
import { parse, format } from "date-fns";
import path from "path";
import axios from "axios";
import pool from "../services/postgres";

const statementRouter = express.Router();

const ENV = "dev"; // prod
const STATEMENT_SERVER_URL = "https://saoke.sucmanh2000.com";
const GET_DATA_API = "/api/getData";
const GET_SUMMARY_API = "/api/getSummary";

statementRouter.get("/", async (req: Request, res: Response) => {
  try {
    const { search, month, year, bank, page, limit }: any = req.query;
    const offset = (page - 1) * limit;

    let whereClauses: string[] = [];
    let values: any[] = [];

    if (search) {
      whereClauses.push(`
        to_tsvector('english', transaction_code || ' ' || description || ' ' || project_name) @@ plainto_tsquery($1)
      `);
      values.push(search);
    }

    if (month) {
      whereClauses.push(`month = $${values.length + 1}`);
      values.push(month);
    }

    if (year) {
      whereClauses.push(`year = $${values.length + 1}`);
      values.push(year);
    }

    if (bank) {
      whereClauses.push(`bank = $${values.length + 1}`);
      values.push(bank);
    }

    const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";

    const query = `
      SELECT * FROM statement
      ${whereSql}
      ORDER BY date DESC
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}
    `;
    values.push(limit, offset);

    let data: any;
    if (ENV === "dev") {
      data = await pool.query(query, values);
    } else if (ENV === "prod") {
      const saokeRes = await axios.get(STATEMENT_SERVER_URL + GET_DATA_API, { params: { query, values } });
      data = saokeRes.data;
    }

    const formattedData = data.rows.map((row: any) => ({
      ...row,
      date: formatDate(row.date),
      amount: row.amount ? parseFloat(row.amount).toLocaleString() : "0",
    }));

    res.json(formattedData);
  } catch (error: any) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Error retrieving data from the database." });
  }
});

statementRouter.get("/summary", async (req: Request, res: Response) => {
  try {
    const { year } = req.query;
    const values = [];
    const conditions = [];

    if (year) {
      conditions.push(`year = $${values.length + 1}`);
      values.push(year);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const summaryQuery = `
      SELECT 
        month, 
        bank, 
        SUM(capital_sum)::numeric::float8 AS capital_sum
      FROM statement_summary
      ${where}
      GROUP BY month, bank
      ORDER BY month, bank
    `;
    const totalQuery = `
      SELECT 
        SUM(capital_sum)::numeric::float8 AS total_capital_sum
      FROM statement_summary
      WHERE capital_sum IS NOT NULL AND capital_sum::text != 'NaN'
    `;

    let summaryResult: any, totalResult: any;
    if (ENV === "dev") {
      [summaryResult, totalResult] = await Promise.all([pool.query(summaryQuery, values), pool.query(totalQuery)]);
    } else if (ENV === "prod") {
      [summaryResult, totalResult] = await Promise.all([
        axios.get(STATEMENT_SERVER_URL + GET_SUMMARY_API, { params: { summaryQuery, values } }),
        axios.get(STATEMENT_SERVER_URL + GET_SUMMARY_API, { params: { totalQuery } }),
      ]);
    }

    res.json({ summary: summaryResult?.rows, total: totalResult?.rows[0]?.total_capital_sum || 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

statementRouter.post("/fetchTransactionDataFromGsheet", async (req: Request, res: Response): Promise<any> => {
  const REQUIRED_COLUMNS = ["Ngày", "Mã giao dịch", "Số tiền", "Nội dung giao dịch", "Tên Công trình", "Mã DA"];
  const { selectedOptions, fromDate, toDate } = req.body;
  const logs: any[] = [];
  const BATCH_SIZE = 100;

  try {
    const { clientSheet, totalSheets } = await initializeGoogleSheets(process.env.STATEMENT_SPREADSHEET_ID ?? "");
    const formattedFromDate = moment(fromDate, "YYYY-MM-DD").format("YYYY-MM-DD");
    const formattedToDate = moment(toDate, "YYYY-MM-DD").format("YYYY-MM-DD");

    const sheetsToProcess = totalSheets.map((sheet: any) => sheet.properties.title).filter((name) => selectedOptions.includes(name) && /^([A-Za-z0-9]+)\.\s*(\d{4})/.test(name));

    logs.push({ message: `Processing Sheets: ${sheetsToProcess.join(", ")} .......` });

    const allSlugs: Record<string, string> = {};
    for (const year of ["du-an-2023", "du-an-2024", "du-an-2025"]) {
      const snapshot = await firestore.collection(year).get();
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.slug) {
          allSlugs[data.slug] = `/${year}/${data.slug}`;
        }
      });
    }

    async function insertBatch(rows: any[]) {
      const query = `
        INSERT INTO statement 
          (date, transaction_code, amount, description, project_name, project_id, project_url, bank)
        VALUES 
          ${rows
            .map(
              (_, i) =>
                `(${Array(8)
                  .fill(0)
                  .map((_, j) => `$${i * 8 + j + 1}`)
                  .join(", ")})`
            )
            .join(", ")}
        ON CONFLICT (transaction_code, date) DO UPDATE SET
          amount = EXCLUDED.amount,
          description = EXCLUDED.description,
          project_name = EXCLUDED.project_name,
          project_id = EXCLUDED.project_id,
          project_url = EXCLUDED.project_url,
          bank = EXCLUDED.bank;
      `;
      const values = rows.flat();

      if (ENV === "dev") {
        await pool.query(query, values);
      } else if (ENV === "prod") {
        await axios.get(STATEMENT_SERVER_URL + GET_DATA_API, { params: { query, values } });
      }
    }

    for (const sheetName of sheetsToProcess) {
      const match = sheetName.match(/^([A-Za-z0-9]+)\.\s*(\d{4})/);
      if (!match) continue;
      const [_, bank, year] = match;

      try {
        const response = await clientSheet.spreadsheets.values.get({
          spreadsheetId: process.env.STATEMENT_SPREADSHEET_ID,
          range: `${sheetName}!A:Z`,
        });

        const data = response.data.values;
        if (!data || data.length === 0) continue;

        const headerRowIndex = data.findIndex((row) => REQUIRED_COLUMNS.every((col) => row.includes(col)));
        if (headerRowIndex === -1) continue;

        const headerRow = data[headerRowIndex];
        const columnIndexes = REQUIRED_COLUMNS.map((col) => headerRow.indexOf(col));
        if (columnIndexes.includes(-1)) continue;

        logs.push({ message: `Sheet "${sheetName}" → Columns to update: ${REQUIRED_COLUMNS.join(", ")}` });

        let dedupMap: Map<string, any> = new Map();

        for (let i = headerRowIndex + 1; i < data.length; i++) {
          const row = data[i];
          const [date, transactionCode, amount, description, projectName, projectId] = columnIndexes.map((index) => row[index] || "");

          const formattedDate = moment(date, "DD/MM/YYYY").format("YYYY-MM-DD");
          if (formattedDate < formattedFromDate || formattedDate > formattedToDate) continue;

          const formattedAmount = parseFloat(amount.replace(/\./g, "")) || 0;
          const maskedDescription = description.trim().replace(/\b(0\d{4})\d{5}\b/g, "$1xxxxx");

          const slug = projectId?.trim()?.toLowerCase();
          const projectUrl = slug && allSlugs[slug] ? allSlugs[slug] : "N/A";

          const values = [formattedDate, transactionCode.trim(), formattedAmount, maskedDescription, projectName.trim(), projectId.trim(), projectUrl, bank === "VVC" ? "TECHCOMBANK" : bank];

          const dedupKey = `${transactionCode.trim()}_${formattedDate}`;
          dedupMap.set(dedupKey, values);

          if (dedupMap.size >= BATCH_SIZE) {
            const dedupedBatch = Array.from(dedupMap.values());
            await insertBatch(dedupedBatch);
            dedupMap.clear();
          }
        }

        if (dedupMap.size > 0) {
          const dedupedBatch = Array.from(dedupMap.values());
          await insertBatch(dedupedBatch);
        }

        logs.push({ message: `✅ Sheet "${sheetName}" processed successfully.` });
      } catch (error: any) {
        logs.push({ error: `❌ Error processing sheet "${sheetName}": ${error.message}` });
      }
    }

    res.status(200).json({ message: "Data processing completed.", logs });
  } catch (error: any) {
    logs.push({ error: `❌ Error fetching data from Google Sheets: ${error.message}` });
    res.status(500).json({ message: "Error processing data.", logs });
  }
});

statementRouter.get("/migrateDataFromCSV", async (req: Request, res: Response): Promise<any> => {
  const BATCH_SIZE = 100;
  let batch: any = [];

  console.log("Starting CSV migration...");

  const csvDirectory = path.join(__dirname, "../csv");
  const files = fs.readdirSync(csvDirectory).filter((file) => file.endsWith(".csv"));
  if (files.length === 0) return;

  async function formatRow(row: any, fileName: string) {
    const [bank, month, year] = fileName.split(".");

    function parseDate(dateString: any) {
      if (!dateString) return null;
      if (!isNaN(Date.parse(dateString))) {
        return new Date(dateString).toISOString();
      }
      const dateParts = dateString.split("/");
      if (dateParts.length === 3) {
        const parsedDate = parse(dateString, "dd/MM/yyyy", new Date());
        return format(parsedDate, "yyyy-MM-dd'T'HH:mm:ssXXX");
      }
      console.error(`Invalid date format: ${dateString}`);
      return null;
    }

    const rawProject = row["CK được phân bổ vào công trình"].trim();
    const [projectId, projectName] = rawProject.split("_");

    const allSlugs: Record<string, string> = {};
    for (const year of ["du-an-2023", "du-an-2024", "du-an-2025"]) {
      const snapshot = await firestore.collection(year).get();
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.slug) {
          allSlugs[data.slug] = `/${year}/${data.slug}`;
        }
      });
    }
    const slug = projectId?.trim()?.toLowerCase();
    const projectUrl = slug && allSlugs[slug] ? allSlugs[slug] : "N/A";

    return {
      date: parseDate(row["Ngày"]),
      transaction_code: row["Mã giao dịch"].trim(),
      amount: row["Số tiền"] ? parseFloat(row["Số tiền"].replace(/\./g, "").replace(",", ".")) : 0,
      description: row["Nội dung giao dịch"].trim().replace(/\b(0\d{4})\d{5}\b/g, "$1xxxxx"),
      project_name: projectName?.trim() ?? "N/A",
      project_id: projectId?.trim() ?? "N/A",
      project_url: projectUrl ?? "N/A",
      bank: bank === "VVC" ? "TECHCOMBANK" : bank,
    };
  }

  async function upsertData(rows: any[]) {
    if (rows.length === 0) return;

    try {
      const columns = ["date", "transaction_code", "amount", "description", "project_name", "project_id", "project_url", "bank"];

      const valuesPlaceholder = rows
        .map((_, rowIndex) => {
          const offset = rowIndex * columns.length;
          const placeholders = columns.map((__, colIndex) => `$${offset + colIndex + 1}`);
          return `(${placeholders.join(", ")})`;
        })
        .join(", ");

      const query = `
        INSERT INTO statement (${columns.join(", ")})
        VALUES ${valuesPlaceholder}
        ON CONFLICT (transaction_code, date) 
        DO UPDATE SET 
          amount = EXCLUDED.amount,
          description = EXCLUDED.description,
          project_name = EXCLUDED.project_name,
          project_id = EXCLUDED.project_id,
          project_url = EXCLUDED.project_url,
          bank = EXCLUDED.bank
      `;
      const values = rows.flatMap((row) => [row.date, row.transaction_code, row.amount, row.description, row.project_name, row.project_id, row.project_url, row.bank]);

      if (ENV === "dev") {
        await pool.query(query, values);
      } else if (ENV === "prod") {
        await axios.get(STATEMENT_SERVER_URL + GET_DATA_API, { params: { query, values } });
      }

      console.log(`✅ Upserted batch of ${rows.length} records`);
    } catch (err) {
      console.error("❌ Error upserting batch:", err);
    }
  }

  async function processFile(fileName: string) {
    console.log(`Processing file: ${fileName}`);

    return new Promise<void>((resolve, reject) => {
      fs.createReadStream(path.join(csvDirectory, fileName))
        .pipe(csv())
        .on("data", async (row: any) => {
          const formattedRow = await formatRow(row, fileName);
          if (formattedRow) {
            batch.push(formattedRow);
          }

          if (batch.length >= BATCH_SIZE) {
            const batchToInsert = [...batch];
            batch = [];
            await upsertData(batchToInsert);
          }
        })
        .on("end", async () => {
          if (batch.length > 0) {
            await upsertData(batch);
          }
          console.log(`Finished processing ${fileName}`);
          resolve();
        })
        .on("error", (err: any) => {
          console.error(`Error reading ${fileName}:`, err);
          reject(err);
        });
    });
  }

  await Promise.all(files.map((file) => processFile(file)));
  console.log("All CSV files processed successfully.");
});

export default statementRouter;

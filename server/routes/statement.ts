import express from "express";
import { Request, Response } from "express";
import moment from "moment";
import { formatDate } from "../utils";
import { firestore } from "../firebase";
import { getValueInRedis, setExValueInRedis } from "../services/redis";
import { initializeGoogleSheets } from "../services/google";
import csv from "csv-parser";
import fs from "fs";
import { parse, format } from "date-fns";
import path from "path";
import axios from "axios";

const statementRouter = express.Router();

const STATEMENT_SERVER_URL = "https://saoke.sucmanh2000.com/api/getData";

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

    if (month && year) {
      const monthYear = `${month}.${year}`;
      whereClauses.push(`month_year = $${values.length + 1}`);
      values.push(monthYear);
    }

    if (bank) {
      whereClauses.push(`bank = $${values.length + 1}`);
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
    values.push(limit, offset);

    // Execute query
    // const data = await pool.query(query, values);

    // Instead, fetch api to VPS server
    const saokeRes = await axios.get(STATEMENT_SERVER_URL, { params: { query, values } });
    const data = saokeRes.data;
    const formattedData = data.rows.map((row: any) => ({
      ...row,
      date: formatDate(row.date),
      amount: row.amount ? parseFloat(row.amount).toLocaleString() : "0",
    }));

    // TODO: redis cache sum in months, years if necessary
    // Get total capital sum from redis
    const cachedKey = `statementCapitalSum`;
    let capitalSum;
    const cachedResultData = await getValueInRedis(cachedKey);
    if (cachedResultData) {
      capitalSum = parseFloat(cachedResultData);
    } else {
      const total = formattedData.reduce((sum: any, row: any) => {
        const numeric = parseFloat(row.amount?.toString().replace(/,/g, "") || "0");
        return sum + (isNaN(numeric) ? 0 : numeric);
      }, 0);
      capitalSum = total;
      await setExValueInRedis(cachedKey, total, true);
    }

    res.json({ data: formattedData, capitalSum: capitalSum });
  } catch (error: any) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Error retrieving data from the database." });
  }
});

statementRouter.post("/fetchTransactionDataFromGsheet", async (req: Request, res: Response): Promise<any> => {
  const REQUIRED_COLUMNS = ["Ngày", "Mã giao dịch", "Số tiền", "Nội dung giao dịch", "Tên Công trình", "Mã DA", "Tháng"];
  const { selectedOptions, fromDate, toDate } = req.body;
  const logs: any[] = [];

  try {
    const { clientSheet, totalSheets } = await initializeGoogleSheets(process.env.STATEMENT_SPREADSHEET_ID ?? "");
    const formattedFromDate = moment(fromDate, "YYYY-MM-DD").format("YYYY-MM-DD");
    const formattedToDate = moment(toDate, "YYYY-MM-DD").format("YYYY-MM-DD");
    const sheetsToProcess = totalSheets.map((sheet: any) => sheet.properties.title).filter((name) => selectedOptions.includes(name) && /^([A-Za-z0-9]+)\.\s*(\d{4})/.test(name));

    logs.push({ message: `Processing Sheets: ${sheetsToProcess.join(", ")} .......` });

    const processingSheets = sheetsToProcess.map(async (sheetName) => {
      const match = sheetName.match(/^([A-Za-z0-9]+)\.\s*(\d{4})/);
      if (!match) return;
      const [_, bank, year] = match;

      try {
        const response = await clientSheet.spreadsheets.values.get({
          spreadsheetId: process.env.STATEMENT_SPREADSHEET_ID,
          range: `${sheetName}!A:Z`,
        });

        const data = response.data.values;
        if (!data || data.length === 0) return;

        const headerRowIndex = data.findIndex((row) => REQUIRED_COLUMNS.every((col) => row.includes(col)));
        if (headerRowIndex === -1) return;

        const headerRow = data[headerRowIndex];
        const columnIndexes = REQUIRED_COLUMNS.map((col) => headerRow.indexOf(col));
        if (columnIndexes.includes(-1)) return;

        logs.push({ message: `Columns to update: ${REQUIRED_COLUMNS.join(", ")}` });

        const promisingData = data.slice(1).map(async (row) => {
          const [date, transactionCode, amount, description, projectName, projectId, month] = columnIndexes.map((index) => row[index] || "");
          const formattedDate = moment(date, "DD/MM/YYYY").format("YYYY-MM-DD");
          const formattedAmount = parseFloat(amount.replace(/\./g, ""));
          const monthYear = `${month.toString().padStart(2, "0")}.${year}`;

          if (formattedDate < formattedFromDate || formattedDate > formattedToDate) return;

          let projectUrl = "N/A";
          const slug = projectId?.toLowerCase();
          if (slug && /^da\d{4}$/.test(slug)) {
            for (const projectYear of ["du-an-2024", "du-an-2025"]) {
              const querySnapshot = await firestore.collection(projectYear).where("slug", "==", slug).get();
              if (!querySnapshot.empty) {
                projectUrl = `/${projectYear}/${slug}`;
                break;
              }
            }
          } else {
            logs.push({ message: `Incorrect "Mã DA": ${projectId} - transaction "${transactionCode}"` });
          }

          const query = `
            INSERT INTO statement 
              (date, transaction_code, amount, description, project_name, project_id, project_url, bank, month_year)
            VALUES 
              ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (transaction_code, date) DO UPDATE SET
              amount = EXCLUDED.amount,
              description = EXCLUDED.description,
              project_name = EXCLUDED.project_name,
              project_id = EXCLUDED.project_id,
              project_url = EXCLUDED.project_url,
              bank = EXCLUDED.bank,
              month_year = EXCLUDED.month_year
          `;
          const values = [formattedDate, transactionCode, formattedAmount, description, projectName, projectId, projectUrl, bank, monthYear];

          await axios.get(STATEMENT_SERVER_URL, { params: { query, values } });
        });
        await Promise.all(promisingData);
      } catch (error: any) {
        logs.push({ error: `Error processing sheet ${sheetName}: ${error.message}` });
      }
    });
    await Promise.all(processingSheets);

    res.status(200).json({ message: "Data processing completed.", logs });
  } catch (error: any) {
    logs.push({ error: `Error fetching data from Google Sheets: ${error.message}` });
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
    const slug = projectId?.trim()?.toLowerCase();
    let projectUrl = "N/A";
    if (slug && /^da\d{4}$/.test(slug)) {
      for (const projectYear of ["du-an-2023", "du-an-2024", "du-an-2025"]) {
        const querySnapshot = await firestore.collection(projectYear).where("slug", "==", slug).get();
        if (!querySnapshot.empty) {
          projectUrl = `/${projectYear}/${slug}`;
          break;
        }
      }
    } else {
      console.log(`--- Incorrect "Mã DA": ${rawProject} - ${projectId} in transaction ${row["Mã giao dịch"].trim()}`);
    }

    return {
      date: parseDate(row["Ngày"]),
      transaction_code: row["Mã giao dịch"].trim(),
      amount: row["Số tiền"] ? parseFloat(row["Số tiền"].replace(/\./g, "").replace(",", ".")) : 0,
      description: row["Nội dung giao dịch"].trim(),
      project_name: projectName?.trim() ?? "N/A",
      project_id: projectId?.trim() ?? "N/A",
      project_url: projectUrl,
      bank: bank,
      month_year: `${month.toString().padStart(2, "0")}.${year}`,
    };
  }

  async function upsertData(rows: any[]) {
    if (rows.length === 0) return;

    try {
      const columns = ["date", "transaction_code", "amount", "description", "project_name", "project_id", "project_url", "bank", "month_year"];

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
          bank = EXCLUDED.bank,
          month_year = EXCLUDED.month_year;
      `;
      const values = rows.flatMap((row) => [row.date, row.transaction_code, row.amount, row.description, row.project_name, row.project_id, row.project_url, row.bank, row.month_year]);

      await axios.get(STATEMENT_SERVER_URL, { params: { query, values } });
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

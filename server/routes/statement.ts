import express from "express";
import { Request, Response } from "express";
import moment from "moment";
import pool from "../services/postgres";
import { formatDate } from "../utils";
import { firestore } from "../firebase";
import { getValueInRedis, setExValueInRedis } from "../services/redis";
import { initializeGoogleSheets } from "../services/google";

const statementRouter = express.Router();

statementRouter.get("/", async (req: Request, res: Response) => {
  try {
    const { search, month, year, bank, page, limit }: any = req.query;
    const offset = (page - 1) * limit;

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
    values.push(limit, offset);

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

    await Promise.all(
      sheetsToProcess.map(async (sheetName) => {
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

          logs.push({ message: `Colomns to update: ${REQUIRED_COLUMNS.join(", ")}` });

          await Promise.all(
            data.slice(1).map(async (row) => {
              const [date, transactionCode, amount, description, project, allocatedFunds, month] = columnIndexes.map((index) => row[index] || "");
              if (!allocatedFunds || allocatedFunds === "Mã DA") return;

              const formattedDate = moment(date, "DD/MM/YYYY").format("YYYY-MM-DD");
              const formattedAmount = parseFloat(amount.replace(/\./g, ""));

              if (formattedDate < formattedFromDate || formattedDate > formattedToDate) return;

              const monthYear = `${month}.${year}`;
              const projectId = allocatedFunds.toLowerCase();
              if (!/^da\d{4}$/.test(projectId)) {
                logs.push({ error: `Incorrect column "Mã DA": "${projectId}" in transaction "${transactionCode}"` });
                return;
              }

              const projectYears = ["du-an-2024", "du-an-2025"];
              let projectUrl = "N/A";
              for (const projectYear of projectYears) {
                const querySnapshot = await firestore.collection(projectYear).where("slug", "==", projectId).get();
                if (!querySnapshot.empty) {
                  projectUrl = `/${projectYear}/${projectId}`;
                  break;
                }
              }

              try {
                const checkQuery = "SELECT COUNT(*) FROM statement WHERE transaction_code = $1";
                const checkResult = await pool.query(checkQuery, [transactionCode]);

                if (checkResult.rows[0].count == 0) {
                  logs.push({ message: `Inserted new transaction "${transactionCode}" - ${date}` });
                  await pool.query(
                    `INSERT INTO statement (date, transaction_code, amount, description, project, allocated_project, construction_unit, month_sheet)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                    [formattedDate, transactionCode, formattedAmount, description, project, projectUrl, bank, monthYear]
                  );
                } else {
                  logs.push({ message: `Updated existing transaction "${transactionCode}" - ${date}` });
                  await pool.query(
                    `UPDATE statement
                     SET date = $1, amount = $2, description = $3, project = $4,
                         allocated_project = $5, construction_unit = $6, month_sheet = $7
                     WHERE transaction_code = $8`,
                    [formattedDate, formattedAmount, description, project, projectUrl, bank, monthYear, transactionCode]
                  );
                }
              } catch (dbError: any) {
                logs.push({ error: `Database error for transaction "${transactionCode}": ${dbError.message}` });
              }
            })
          );
        } catch (error: any) {
          logs.push({ error: `Error processing sheet ${sheetName}: ${error.message}` });
        }
      })
    );

    res.status(200).json({ message: "Data processing completed.", logs });
  } catch (error: any) {
    logs.push({ error: `Error fetching data from Google Sheets: ${error.message}` });
    res.status(500).json({ message: "Error processing data.", logs });
  }
});

export default statementRouter;

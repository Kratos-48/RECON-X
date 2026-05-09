import XLSX from "xlsx";
import { v4 as uuidv4 } from "uuid";
import { db } from "../config/db.js";

const parseExcel = (filePath) => {
  const workbook = XLSX.readFile(filePath);
  const sheets = {};

  workbook.SheetNames.forEach((sheetName) => {
    const sheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    // Trim all column headers and string values
    const cleanData = rawData.map((row) => {
      const cleanRow = {};
      Object.keys(row).forEach((key) => {
        const cleanKey = key.trim();
        const val = row[key];
        cleanRow[cleanKey] = typeof val === "string" ? val.trim() : val;
      });
      return cleanRow;
    });

    sheets[sheetName] = cleanData;
  });

  return sheets;
};

const compareSheets = (sheet1, sheet2, keyColumn) => {
  const results = [];
  const rowsWithIssues = new Set();

  const map1 = new Map();
  const map2 = new Map();

  sheet1.forEach((row) => map1.set(String(row[keyColumn]).trim(), row));
  sheet2.forEach((row) => map2.set(String(row[keyColumn]).trim(), row));

  // Rows in file1 but not in file2
  map1.forEach((row, key) => {
    if (!map2.has(key)) {
      rowsWithIssues.add(key);
      results.push({
        row_key: key,
        type: "missing_in_file2",
        column_name: null,
        file1_value: JSON.stringify(row),
        file2_value: null,
      });
    } else {
      // Compare values column by column
      const row2 = map2.get(key);
      const allColumns = new Set([
        ...Object.keys(row).map((k) => k.trim()),
        ...Object.keys(row2).map((k) => k.trim()),
      ]);

      allColumns.forEach((col) => {
        if (col === keyColumn.trim()) return;
        const val1 = String(row[col] ?? "").trim();
        const val2 = String(row2[col] ?? "").trim();
        if (val1 !== val2) {
          rowsWithIssues.add(key);
          results.push({
            row_key: key,
            type: "mismatch",
            column_name: col,
            file1_value: val1 || "—",
            file2_value: val2 || "—",
          });
        }
      });
    }
  });

  // Rows in file2 but not in file1
  map2.forEach((row, key) => {
    if (!map1.has(key)) {
      rowsWithIssues.add(key);
      results.push({
        row_key: key,
        type: "missing_in_file1",
        column_name: null,
        file1_value: null,
        file2_value: JSON.stringify(row),
      });
    }
  });

  const totalRows = new Set([...map1.keys(), ...map2.keys()]).size;
  const matchedRows = totalRows - rowsWithIssues.size;

  return { results, totalRows, matchedRows, rowsWithIssues };
};

export const uploadFiles = (req, res) => {
  try {
    const file1 = req.files["file1"]?.[0];
    const file2 = req.files["file2"]?.[0];
    const keyColumn = req.body.keyColumn?.trim();

    if (!file1 || !file2 || !keyColumn) {
      return res.status(400).json({ error: "Both files and a key column are required" });
    }

    const jobId = uuidv4();

    const sheets1 = parseExcel(file1.path);
    const sheets2 = parseExcel(file2.path);

    const allSheets = new Set([...Object.keys(sheets1), ...Object.keys(sheets2)]);

    let totalRows = 0;
    let matchedRows = 0;
    let mismatchedRows = 0;
    let missingInFile2 = 0;
    let missingInFile1 = 0;

    const insertResult = db.prepare(`
      INSERT INTO results (job_id, sheet_name, row_key, type, column_name, file1_value, file2_value)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((results, sheetName) => {
      results.forEach((r) => {
        insertResult.run(jobId, sheetName, r.row_key, r.type, r.column_name, r.file1_value, r.file2_value);
      });
    });

    allSheets.forEach((sheetName) => {
      const s1 = sheets1[sheetName] || [];
      const s2 = sheets2[sheetName] || [];

      const { results, totalRows: sheetTotal, matchedRows: sheetMatched, rowsWithIssues } = compareSheets(s1, s2, keyColumn);

      totalRows += sheetTotal;
      matchedRows += sheetMatched;

      results.forEach((r) => {
        if (r.type === "mismatch") mismatchedRows++;
        if (r.type === "missing_in_file2") missingInFile2++;
        if (r.type === "missing_in_file1") missingInFile1++;
      });

      insertMany(results, sheetName);
    });

    db.prepare(`
      INSERT INTO jobs (job_id, file1_name, file2_name, status, total_rows, matched_rows, mismatched_rows, missing_in_file2, missing_in_file1)
      VALUES (?, ?, ?, 'completed', ?, ?, ?, ?, ?)
    `).run(jobId, file1.originalname, file2.originalname, totalRows, matchedRows, mismatchedRows, missingInFile2, missingInFile1);

    res.status(200).json({
      message: "Reconciliation complete",
      jobId,
      stats: { totalRows, matchedRows, mismatchedRows, missingInFile2, missingInFile1 },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong during reconciliation" });
  }
};
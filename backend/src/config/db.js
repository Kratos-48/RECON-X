import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const uploadsPath = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

const dbPath = path.join(__dirname, "../../recon-x.db");

export const db = new Database(dbPath);

export const initDB = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id TEXT UNIQUE NOT NULL,
      file1_name TEXT,
      file2_name TEXT,
      status TEXT DEFAULT 'pending',
      total_rows INTEGER DEFAULT 0,
      matched_rows INTEGER DEFAULT 0,
      mismatched_rows INTEGER DEFAULT 0,
      missing_in_file2 INTEGER DEFAULT 0,
      missing_in_file1 INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id TEXT NOT NULL,
      sheet_name TEXT,
      row_key TEXT,
      type TEXT,
      column_name TEXT,
      file1_value TEXT,
      file2_value TEXT
    );
  `);

  console.log("✅ Database initialized");
};

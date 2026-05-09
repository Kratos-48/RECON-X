import XLSX from "xlsx";
import { db } from "../config/db.js";

export const getAllJobs = (req, res) => {
  try {
    const jobs = db.prepare("SELECT * FROM jobs ORDER BY created_at DESC").all();
    res.status(200).json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
};

export const getJobById = (req, res) => {
  try {
    const { jobId } = req.params;
    const job = db.prepare("SELECT * FROM jobs WHERE job_id = ?").get(jobId);
    if (!job) return res.status(404).json({ error: "Job not found" });
    res.status(200).json(job);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch job" });
  }
};

export const getJobResults = (req, res) => {
  try {
    const { jobId } = req.params;
    const { page = 1, limit = 50, type, sheet } = req.query;
    const offset = (page - 1) * limit;

    let query = "SELECT * FROM results WHERE job_id = ?";
    const params = [jobId];

    if (type) { query += " AND type = ?"; params.push(type); }
    if (sheet) { query += " AND sheet_name = ?"; params.push(sheet); }

    query += " LIMIT ? OFFSET ?";
    params.push(Number(limit), Number(offset));

    const results = db.prepare(query).all(...params);
    const total = db.prepare("SELECT COUNT(*) as count FROM results WHERE job_id = ?").get(jobId).count;

    res.status(200).json({
      results,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch results" });
  }
};

export const exportJob = (req, res) => {
  try {
    const { jobId } = req.params;

    const job = db.prepare("SELECT * FROM jobs WHERE job_id = ?").get(jobId);
    if (!job) return res.status(404).json({ error: "Job not found" });

    const results = db.prepare("SELECT * FROM results WHERE job_id = ?").all(jobId);

    const wb = XLSX.utils.book_new();

    // --- Sheet 1: Summary ---
    const summaryData = [
      ["RECON-X Export Report"],
      [],
      ["Job ID", job.job_id],
      ["File A", job.file1_name],
      ["File B", job.file2_name],
      ["Status", job.status],
      ["Date", job.created_at],
      [],
      ["STATISTICS"],
      ["Total Rows", job.total_rows],
      ["Matched Rows", job.matched_rows],
      ["Value Mismatches", job.mismatched_rows],
      ["Missing in File A", job.missing_in_file1],
      ["Missing in File B", job.missing_in_file2],
      ["Match %", job.total_rows ? Math.round((job.matched_rows / job.total_rows) * 100) + "%" : "0%"],
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");

    // --- Sheet 2: All Results ---
    const allRows = [["Row Key", "Sheet", "Type", "Column", "File 1 Value", "File 2 Value"]];
    results.forEach((r) => {
      allRows.push([r.row_key, r.sheet_name, r.type, r.column_name || "—", r.file1_value || "—", r.file2_value || "—"]);
    });
    const allSheet = XLSX.utils.aoa_to_sheet(allRows);
    XLSX.utils.book_append_sheet(wb, allSheet, "All Results");

    // --- Sheet 3: Mismatches only ---
    const mismatches = results.filter((r) => r.type === "mismatch");
    if (mismatches.length > 0) {
      const mismatchRows = [["Row Key", "Sheet", "Column", "File 1 Value", "File 2 Value"]];
      mismatches.forEach((r) => {
        mismatchRows.push([r.row_key, r.sheet_name, r.column_name, r.file1_value || "—", r.file2_value || "—"]);
      });
      const mismatchSheet = XLSX.utils.aoa_to_sheet(mismatchRows);
      XLSX.utils.book_append_sheet(wb, mismatchSheet, "Mismatches");
    }

    // --- Sheet 4: Missing Records ---
    const missing = results.filter((r) => r.type === "missing_in_file1" || r.type === "missing_in_file2");
    if (missing.length > 0) {
      const missingRows = [["Row Key", "Sheet", "Type", "File 1 Value", "File 2 Value"]];
      missing.forEach((r) => {
        missingRows.push([r.row_key, r.sheet_name, r.type === "missing_in_file1" ? "Missing in A" : "Missing in B", r.file1_value || "—", r.file2_value || "—"]);
      });
      const missingSheet = XLSX.utils.aoa_to_sheet(missingRows);
      XLSX.utils.book_append_sheet(wb, missingSheet, "Missing Records");
    }

    // Send file
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    res.setHeader("Content-Disposition", `attachment; filename=RECON-X-${jobId.slice(0, 8)}.xlsx`);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.send(buffer);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to export job" });
  }
};

export const deleteJob = (req, res) => {
  try {
    const { jobId } = req.params;
    db.prepare("DELETE FROM results WHERE job_id = ?").run(jobId);
    db.prepare("DELETE FROM jobs WHERE job_id = ?").run(jobId);
    res.status(200).json({ message: "Job deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete job" });
  }
};
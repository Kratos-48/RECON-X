import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { initDB } from "./config/db.js";
import jobRoutes from "./routes/job.routes.js";
import uploadRoutes from "./routes/upload.routes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/jobs", jobRoutes);
app.use("/api/upload", uploadRoutes);

// Serve frontend static files
const frontendPath = path.join(__dirname, "../../frontend");
app.use(express.static(frontendPath));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ message: "RECON-X Backend is running 🚀" });
});

// SPA fallback — serve index.html for non-API routes
app.get("/{*path}", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// Initialize DB then start server
initDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit: http://localhost:${PORT}`);
});
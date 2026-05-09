import express from "express";
import {
  getAllJobs,
  getJobById,
  getJobResults,
  deleteJob,
  exportJob,
} from "../controllers/job.controller.js";

const router = express.Router();

router.get("/", getAllJobs);
router.get("/:jobId", getJobById);
router.get("/:jobId/results", getJobResults);
router.get("/:jobId/export", exportJob);
router.delete("/:jobId", deleteJob);

export default router;
import express from "express";
import multer from "multer";
import { uploadFiles } from "../controllers/upload.controller.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage });

router.post("/", upload.fields([{ name: "file1" }, { name: "file2" }]), uploadFiles);

export default router;  
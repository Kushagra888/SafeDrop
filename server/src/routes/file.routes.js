import express from "express";
import multer from "multer";
import { 
  uploadFiles, 
  downloadFile, 
  deleteFile, 
  updateFileStatus,
  updateFileExpiry,
  updateFilePassword,
  searchFiles,
  showUserFiles,
  getFileDetails,
  generateShareShortenLink,
  sendLinkEmail,
  generateQR,
  getDownloadCount,
  resolveShareLink,
  verifyFilePassword,
  getUserFiles
} from "../controllers/file.controller.js";
import { authenticateUser } from "../middlewares/auth.middlewares.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 30 * 1024 * 1024 }
});

// File upload route
router.post("/upload", upload.array("files", 5), uploadFiles);

// File download routes - support both GET and POST
router.get("/download/:fileId", downloadFile);
router.post("/download/:fileId", downloadFile);

// File management routes
router.delete("/:fileId", authenticateUser, deleteFile);
router.put("/status/:fileId", authenticateUser, updateFileStatus);
router.put("/expiry", authenticateUser, updateFileExpiry);
router.put("/password", authenticateUser, updateFilePassword);

// File search and listing
router.get("/search", searchFiles);
router.get("/user-files", authenticateUser, getUserFiles);
router.get("/user/:userId", showUserFiles);

// File sharing features
router.post("/share", authenticateUser, generateShareShortenLink);
router.post("/email", authenticateUser, sendLinkEmail);
router.get("/:fileId/qr", generateQR);
router.get("/:fileId/downloads", getDownloadCount);

// Share link resolution
router.get("/shared/:code", resolveShareLink);
router.post("/verify-password", verifyFilePassword);

export default router;
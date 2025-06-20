import multer from 'multer';
import path from 'path';

// Define allowed file extensions
const allowedExtensions = [
  '.jpg', '.jpeg', '.webp', '.png',
  '.mp4', '.avi', '.mov', '.mkv', '.mk3d', '.mks', '.mka',
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
  '.txt', '.zip', '.rar', '.7z'
];

// Configure multer for memory storage
// We'll handle the actual file storage in our controller
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { 
    fileSize: 50 * 1024 * 1024 // 50 MB
  },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      return cb(new Error(`❌ Unsupported file type: ${ext}`));
    }
    cb(null, true);
  }
});

export default upload;

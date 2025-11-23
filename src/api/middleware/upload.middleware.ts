import multer from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { sanitizeFilename, getUniqueFilename, getUploadDirectory } from '../utils/file.utils';

// Get upload directory
const uploadDir = getUploadDirectory();

// Ensure upload directory exists
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const sanitizedName = sanitizeFilename(file.originalname);
    const uniqueName = getUniqueFilename(uploadDir, sanitizedName);
    cb(null, uniqueName);
  }
});

// Configure multer with file validation
export const uploadMiddleware = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Allowed image types
    const allowedMimes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml'
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Only ${allowedMimes.join(', ')} are allowed.`));
    }
  }
});

// Error handling middleware for multer
export const handleMulterError = (error: any, req: any, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    // Handle specific multer errors
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File size too large. Maximum 5MB allowed per file.'
      });
    }

    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Too many files. You can upload a maximum of 50 images at once.'
      });
    }

    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        error: 'Unexpected field in upload. Please try again.'
      });
    }

    // Generic multer error
    return res.status(400).json({
      error: `Upload error: ${error.message}`
    });
  }

  // Custom validation errors
  if (error) {
    return res.status(400).json({ error: error.message });
  }

  next();
};

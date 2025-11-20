import { Router } from 'express';
import multer from 'multer';
import { join, extname } from 'path';
import { existsSync, mkdirSync } from 'fs';

const uploadRouter = Router();

// Configure upload directory
const uploadDir = join(process.cwd(), 'uploads', 'images');

// Ensure upload directory exists
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}


// Function to sanitize filename
function sanitizeFilename(filename: string): string {
  const ext = extname(filename);
  const nameWithoutExt = filename.slice(0, -ext.length);

  // Normalize and remove accents
  let sanitized = nameWithoutExt
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Remove diacritics/accents

  // Replace spaces with hyphens
  sanitized = sanitized.replace(/\s+/g, '-');

  // Replace special characters (keep only alphanumeric, hyphens, underscores)
  sanitized = sanitized.replace(/[^a-zA-Z0-9-_]/g, '');

  // Convert to lowercase
  sanitized = sanitized.toLowerCase();

  // Remove multiple consecutive hyphens
  sanitized = sanitized.replace(/-+/g, '-');

  // Remove leading/trailing hyphens
  sanitized = sanitized.replace(/^-+|-+$/g, '');

  return `${sanitized}${ext.toLowerCase()}`;
}

// Function to generate unique filename if file already exists
function getUniqueFilename(targetDir: string, filename: string): string {
  const ext = extname(filename);
  const nameWithoutExt = filename.slice(0, -ext.length);
  let finalFilename = filename;
  let targetPath = join(targetDir, finalFilename);

  // Check if file exists, if so, append timestamp
  if (existsSync(targetPath)) {
    const timestamp = Date.now();
    finalFilename = `${nameWithoutExt}-${timestamp}${ext}`;
  }

  return finalFilename;
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
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Allowed image types
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Only ${allowedMimes.join(', ')} are allowed.`));
    }
  }
});

// Upload endpoint - accepts multiple files (up to 50)
uploadRouter.post('/upload', upload.array('images', 50), (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // Return file information
    const uploadedFiles = files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      path: `/uploads/images/${file.filename}`
    }));

    console.log(`Successfully uploaded ${files.length} file(s)`);

    return res.status(200).json({
      message: 'Files uploaded successfully',
      files: uploadedFiles
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Failed to upload files' });
  }
});

// Error handling middleware for multer
uploadRouter.use((error: any, req: any, res: any, next: any) => {
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
});

export default uploadRouter;

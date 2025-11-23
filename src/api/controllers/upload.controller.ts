import { Request, Response } from 'express';
import { getPublicImagePath } from '../utils/file.utils';

/**
 * Upload images controller
 * Handles multiple file uploads
 */
export const uploadImages = (req: Request, res: Response) => {
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
      path: getPublicImagePath(file.filename)
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
};

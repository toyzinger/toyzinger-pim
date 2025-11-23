import { Request, Response } from 'express';
import { join } from 'path';
import { existsSync } from 'fs';
import { unlink } from 'fs/promises';
import { isValidFilename, getUploadDirectory } from '../utils/file.utils';

const uploadDir = getUploadDirectory();

/**
 * Delete image controller
 * Deletes a single image file
 */
export const deleteImage = async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;

    // Validate filename (prevent path traversal attacks)
    if (!isValidFilename(filename)) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    const filePath = join(uploadDir, filename);

    // Check if file exists
    if (!existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Delete the file
    await unlink(filePath);

    console.log(`Successfully deleted file: ${filename}`);

    return res.status(200).json({
      message: 'File deleted successfully',
      filename: filename
    });
  } catch (error) {
    console.error('Delete error:', error);
    return res.status(500).json({ error: 'Failed to delete file' });
  }
};

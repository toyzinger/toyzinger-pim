import { extname, join } from 'path';
import { existsSync } from 'fs';

/**
 * Sanitize filename by removing accents, special characters, and normalizing
 */
export function sanitizeFilename(filename: string): string {
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

/**
 * Generate unique filename if file already exists by appending a timestamp
 */
export function getUniqueFilename(targetDir: string, filename: string): string {
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

/**
 * Validate filename to prevent path traversal attacks
 */
export function isValidFilename(filename: string): boolean {
  if (!filename) return false;
  if (filename.includes('..')) return false;
  if (filename.includes('/')) return false;
  if (filename.includes('\\')) return false;
  return true;
}

/**
 * Get upload directory path
 */
export function getUploadDirectory(): string {
  return join(process.cwd(), 'uploads', 'images');
}

/**
 * Get public URL path for an image
 */
export function getPublicImagePath(filename: string): string {
  return `/uploads/images/${filename}`;
}

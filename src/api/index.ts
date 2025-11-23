import { Router } from 'express';
import { uploadMiddleware, handleMulterError } from './middleware/upload.middleware';
import { uploadImages } from './controllers/upload.controller';
import { deleteImage } from './controllers/delete.controller';

const apiRouter = Router();

/**
 * Main API router
 * Defines all API routes
 */

/**
 * POST /upload
 * Upload multiple images (up to 50 files)
 */
apiRouter.post('/upload', uploadMiddleware.array('images', 50), uploadImages);

/**
 * DELETE /delete/:filename
 * Delete a single image by filename
 */
apiRouter.delete('/delete/:filename', deleteImage);

/**
 * Error handling middleware for multer
 */
apiRouter.use(handleMulterError);

// Add more route modules here as the API grows
// Example:
// apiRouter.use('/products', productsRouter);
// apiRouter.use('/auth', authRouter);

export default apiRouter;

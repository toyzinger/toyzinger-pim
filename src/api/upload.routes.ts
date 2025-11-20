import { Router } from 'express';

const uploadRouter = Router();

uploadRouter.post('/upload', (req, res) => {
  // Placeholder for upload logic
  console.log('Upload endpoint hit');
  res.status(200).json({ message: 'Upload endpoint ready' });
});

export default uploadRouter;

import multer from 'multer';
import { Request } from 'express';

// Configure multer to use memory storage for direct upload to Cloudinary
const storage = multer.memoryStorage();

// File filter to accept only PDFs and images
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Accept PDFs and images
  if (
    file.mimetype === 'application/pdf' ||
    file.mimetype.startsWith('image/')
  ) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and image files are allowed'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

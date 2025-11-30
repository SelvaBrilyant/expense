import { Request, Response } from 'express';
import cloudinary from '../config/cloudinary';
import { Readable } from 'stream';

// @desc    Upload image to Cloudinary
// @route   POST /api/upload
// @access  Private
export const uploadImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('No file uploaded');
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      res.status(400);
      throw new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed');
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (req.file.size > maxSize) {
      res.status(400);
      throw new Error('File size exceeds 5MB limit');
    }

    // Upload to Cloudinary
    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'expense-tracker/profile-images',
          transformation: [
            { width: 1000, crop: 'limit' },
            { quality: 'auto' },
            { fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      // Convert buffer to stream and pipe to Cloudinary
      const bufferStream = new Readable();
      bufferStream.push(req.file!.buffer);
      bufferStream.push(null);
      bufferStream.pipe(uploadStream);
    });

    const result = await uploadPromise as any;

    res.status(200).json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error: any) {
    res.status(500);
    throw new Error(error.message || 'Failed to upload image');
  }
};

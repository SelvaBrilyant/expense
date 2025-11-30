import express from 'express';
import multer from 'multer';
import { uploadImage, uploadInvoice } from '../controllers/uploadController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Upload an image
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 url:
 *                   type: string
 *                 publicId:
 *                   type: string
 *       400:
 *         description: Bad request - invalid file
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/', protect, upload.single('image'), uploadImage);

/**
 * @swagger
 * /api/upload/invoice:
 *   post:
 *     summary: Upload an invoice (PDF or image)
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               invoice:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Invoice uploaded successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post('/invoice', protect, upload.single('invoice'), uploadInvoice);

export default router;

import express from 'express';
import { getInsights } from '../controllers/aiController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: AI
 *   description: AI Financial Advisor
 */

/**
 * @swagger
 * /api/ai/insights:
 *   post:
 *     summary: Get AI financial insights
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: AI insights and suggestions
 *       401:
 *         description: Not authorized
 */
router.post('/insights', protect, getInsights);

export default router;

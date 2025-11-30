import express from 'express';
import {
  getInsights,
  analyzeSpendingPatterns,
  detectOverspending,
  getCategoryAdvice,
  getRecommendations,
} from '../controllers/aiController';
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
 */
router.post('/insights', protect, getInsights);

/**
 * @swagger
 * /api/ai/patterns:
 *   get:
 *     summary: Analyze spending patterns
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 */
router.get('/patterns', protect, analyzeSpendingPatterns);

/**
 * @swagger
 * /api/ai/overspending:
 *   get:
 *     summary: Detect overspending alerts
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 */
router.get('/overspending', protect, detectOverspending);

/**
 * @swagger
 * /api/ai/category/:category:
 *   get:
 *     summary: Get category-specific advice
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 */
router.get('/category/:category', protect, getCategoryAdvice);

/**
 * @swagger
 * /api/ai/recommendations:
 *   get:
 *     summary: Get personalized recommendations
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 */
router.get('/recommendations', protect, getRecommendations);

export default router;


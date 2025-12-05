import express from "express";
import {
  getInsights,
  chatWithAdvisor,
  getWeeklyReport,
  analyzeSpendingPatterns,
  detectOverspending,
  getCategoryAdvice,
  getRecommendations,
  parseInvoice,
} from "../controllers/aiController";
import { protect } from "../middlewares/authMiddleware";
import { upload } from "../middleware/upload.middleware";

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
router.post("/insights", protect, getInsights);

/**
 * @swagger
 * /api/ai/chat:
 *   post:
 *     summary: Chat with AI advisor
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 */
router.post("/chat", protect, chatWithAdvisor);

/**
 * @swagger
 * /api/ai/weekly-report:
 *   get:
 *     summary: Get weekly financial report
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 */
router.get("/weekly-report", protect, getWeeklyReport);

/**
 * @swagger
 * /api/ai/patterns:
 *   get:
 *     summary: Analyze spending patterns
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 */
router.get("/patterns", protect, analyzeSpendingPatterns);

/**
 * @swagger
 * /api/ai/overspending:
 *   get:
 *     summary: Detect overspending alerts
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 */
router.get("/overspending", protect, detectOverspending);

/**
 * @swagger
 * /api/ai/category/:category:
 *   get:
 *     summary: Get category-specific advice
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 */
router.get("/category/:category", protect, getCategoryAdvice);

/**
 * @swagger
 * /api/ai/recommendations:
 *   get:
 *     summary: Get personalized recommendations
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 */
router.get("/recommendations", protect, getRecommendations);

/**
 * @swagger
 * /api/ai/parse-invoice:
 *   post:
 *     summary: Parse invoice image using AI to extract transaction details
 *     tags: [AI]
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
 *         description: Invoice parsed successfully
 *       400:
 *         description: Invalid file or no file uploaded
 *       422:
 *         description: Failed to parse invoice
 *       500:
 *         description: Server error
 */
router.post("/parse-invoice", protect, upload.single("invoice"), parseInvoice);

export default router;

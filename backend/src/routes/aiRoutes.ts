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
  suggestCategory,
  predictSpending,
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
 * /api/ai/predict-spending:
 *   get:
 *     summary: Predict next month's spending
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Spending predictions by category
 *       500:
 *         description: Server error
 */
router.get("/predict-spending", protect, predictSpending);

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

/**
 * @swagger
 * /api/ai/suggest-category:
 *   post:
 *     summary: Suggest category based on transaction title
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 description: Transaction title to analyze
 *               type:
 *                 type: string
 *                 enum: [INCOME, EXPENSE]
 *                 default: EXPENSE
 *     responses:
 *       200:
 *         description: Category suggestion returned
 *       400:
 *         description: Title is required
 *       500:
 *         description: Server error
 */
router.post("/suggest-category", protect, suggestCategory);

export default router;

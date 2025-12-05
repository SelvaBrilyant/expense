import express from "express";
import { protect } from "../middlewares/authMiddleware";
import {
  exportDashboard,
  exportTransactions,
  exportCategories,
} from "../controllers/excelController";
import { generatePDFReport } from "../controllers/pdfController";

const router = express.Router();

/**
 * @swagger
 * /api/export/dashboard:
 *   get:
 *     summary: Export dashboard data with pivot tables
 *     tags: [Export]
 *     security:
 *       - bearerAuth: []
 */
router.get("/dashboard", protect, exportDashboard);

/**
 * @swagger
 * /api/export/transactions:
 *   get:
 *     summary: Export all transactions to Excel
 *     tags: [Export]
 *     security:
 *       - bearerAuth: []
 */
router.get("/transactions", protect, exportTransactions);

/**
 * @swagger
 * /api/export/categories:
 *   get:
 *     summary: Export category summary to Excel
 *     tags: [Export]
 *     security:
 *       - bearerAuth: []
 */
router.get("/categories", protect, exportCategories);

/**
 * @swagger
 * /api/export/pdf-report:
 *   get:
 *     summary: Generate PDF financial report
 *     tags: [Export]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Year for the report (defaults to current year)
 */
router.get("/pdf-report", protect, generatePDFReport);

export default router;

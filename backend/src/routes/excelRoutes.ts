import express from 'express';
import { protect } from '../middlewares/authMiddleware';
import {
  exportDashboard,
  exportTransactions,
  exportCategories,
} from '../controllers/excelController';

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
router.get('/dashboard', protect, exportDashboard);

/**
 * @swagger
 * /api/export/transactions:
 *   get:
 *     summary: Export all transactions to Excel
 *     tags: [Export]
 *     security:
 *       - bearerAuth: []
 */
router.get('/transactions', protect, exportTransactions);

/**
 * @swagger
 * /api/export/categories:
 *   get:
 *     summary: Export category summary to Excel
 *     tags: [Export]
 *     security:
 *       - bearerAuth: []
 */
router.get('/categories', protect, exportCategories);

export default router;

import express from 'express';
import { protect } from '../middlewares/authMiddleware';
import {
  getRecurringTransactions,
  createRecurringTransaction,
  updateRecurringTransaction,
  deleteRecurringTransaction,
  toggleRecurringTransaction,
} from '../controllers/recurringController';

const router = express.Router();

/**
 * @swagger
 * /api/recurring:
 *   get:
 *     summary: Get all recurring transactions
 *     tags: [Recurring]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', protect, getRecurringTransactions);

/**
 * @swagger
 * /api/recurring:
 *   post:
 *     summary: Create a recurring transaction
 *     tags: [Recurring]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', protect, createRecurringTransaction);

/**
 * @swagger
 * /api/recurring/:id:
 *   put:
 *     summary: Update a recurring transaction
 *     tags: [Recurring]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', protect, updateRecurringTransaction);

/**
 * @swagger
 * /api/recurring/:id:
 *   delete:
 *     summary: Delete a recurring transaction
 *     tags: [Recurring]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', protect, deleteRecurringTransaction);

/**
 * @swagger
 * /api/recurring/:id/toggle:
 *   post:
 *     summary: Toggle recurring transaction active status
 *     tags: [Recurring]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/toggle', protect, toggleRecurringTransaction);

export default router;

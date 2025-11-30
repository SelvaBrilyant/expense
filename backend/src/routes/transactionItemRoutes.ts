import express from 'express';
import { protect } from '../middlewares/authMiddleware';
import {
  getTransactionItems,
  addTransactionItem,
  updateTransactionItem,
  deleteTransactionItem,
} from '../controllers/transactionItemController';

const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * /api/transactions/:transactionId/items:
 *   get:
 *     summary: Get all items for a transaction
 *     tags: [Transaction Items]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', protect, getTransactionItems);

/**
 * @swagger
 * /api/transactions/:transactionId/items:
 *   post:
 *     summary: Add item to transaction
 *     tags: [Transaction Items]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', protect, addTransactionItem);

/**
 * @swagger
 * /api/transactions/:transactionId/items/:id:
 *   put:
 *     summary: Update transaction item
 *     tags: [Transaction Items]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', protect, updateTransactionItem);

/**
 * @swagger
 * /api/transactions/:transactionId/items/:id:
 *   delete:
 *     summary: Delete transaction item
 *     tags: [Transaction Items]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', protect, deleteTransactionItem);

export default router;

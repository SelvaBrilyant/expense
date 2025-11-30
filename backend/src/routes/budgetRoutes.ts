import express from 'express';
import { getBudgets, setBudget, deleteBudget, getBudgetsWithSpending, updateBudget } from '../controllers/budgetController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Budgets
 *   description: Budget management
 */

/**
 * @swagger
 * /api/budgets:
 *   get:
 *     summary: Get all budgets
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of budgets
 *       401:
 *         description: Not authorized
 *   post:
 *     summary: Set a new budget
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category
 *               - amount
 *               - period
 *             properties:
 *               category:
 *                 type: string
 *               amount:
 *                 type: number
 *               period:
 *                 type: string
 *                 enum: [MONTHLY, WEEKLY, YEARLY]
 *     responses:
 *       201:
 *         description: Budget created
 *       401:
 *         description: Not authorized
 */
router.route('/')
  .get(protect, getBudgets)
  .post(protect, setBudget);

/**
 * @swagger
 * /api/budgets/spending:
 *   get:
 *     summary: Get budgets with spending data
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Budgets with spending analysis
 *       401:
 *         description: Not authorized
 */
router.get('/spending', protect, getBudgetsWithSpending);

/**
 * @swagger
 * /api/budgets/{id}:
 *   put:
 *     summary: Update a budget
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Budget ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *               amount:
 *                 type: number
 *               period:
 *                 type: string
 *     responses:
 *       200:
 *         description: Budget updated
 *       404:
 *         description: Budget not found
 *   delete:
 *     summary: Delete a budget
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Budget ID
 *     responses:
 *       200:
 *         description: Budget deleted
 *       404:
 *         description: Budget not found
 */
router.route('/:id')
  .put(protect, updateBudget)
  .delete(protect, deleteBudget);

export default router;

import express from 'express';
import {
  getSavings,
  getSavingById,
  createSaving,
  updateSaving,
  deleteSaving,
  addToSaving,
  withdrawFromSaving,
} from '../controllers/savingsController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Savings
 *   description: Savings goal management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Saving:
 *       type: object
 *       required:
 *         - title
 *         - targetAmount
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated unique identifier
 *         userId:
 *           type: string
 *           description: User ID
 *         title:
 *           type: string
 *           description: Savings goal title
 *         targetAmount:
 *           type: number
 *           description: Target amount to save
 *         currentAmount:
 *           type: number
 *           description: Current saved amount
 *           default: 0
 *         category:
 *           type: string
 *           enum: [EMERGENCY, VACATION, EDUCATION, HOME, CAR, INVESTMENT, RETIREMENT, OTHER]
 *           default: OTHER
 *         priority:
 *           type: string
 *           enum: [HIGH, MEDIUM, LOW]
 *           default: MEDIUM
 *         deadline:
 *           type: string
 *           format: date-time
 *           description: Target date to achieve the goal
 *         notes:
 *           type: string
 *           description: Additional notes
 *         isCompleted:
 *           type: boolean
 *           description: Whether the goal is completed
 *           default: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/savings:
 *   get:
 *     summary: Get all savings goals
 *     tags: [Savings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [EMERGENCY, VACATION, EDUCATION, HOME, CAR, INVESTMENT, RETIREMENT, OTHER]
 *         description: Filter by category
 *       - in: query
 *         name: isCompleted
 *         schema:
 *           type: boolean
 *         description: Filter by completion status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [HIGH, MEDIUM, LOW]
 *         description: Filter by priority
 *     responses:
 *       200:
 *         description: List of savings goals
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Saving'
 *       401:
 *         description: Not authorized
 *   post:
 *     summary: Create a new savings goal
 *     tags: [Savings]
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
 *               - targetAmount
 *             properties:
 *               title:
 *                 type: string
 *               targetAmount:
 *                 type: number
 *               currentAmount:
 *                 type: number
 *               category:
 *                 type: string
 *                 enum: [EMERGENCY, VACATION, EDUCATION, HOME, CAR, INVESTMENT, RETIREMENT, OTHER]
 *               priority:
 *                 type: string
 *                 enum: [HIGH, MEDIUM, LOW]
 *               deadline:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Savings goal created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Saving'
 *       401:
 *         description: Not authorized
 */
router.route('/')
  .get(protect, getSavings)
  .post(protect, createSaving);

/**
 * @swagger
 * /api/savings/{id}:
 *   get:
 *     summary: Get a specific savings goal
 *     tags: [Savings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Saving goal ID
 *     responses:
 *       200:
 *         description: Savings goal details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Saving'
 *       404:
 *         description: Savings goal not found
 *       401:
 *         description: Not authorized
 *   put:
 *     summary: Update a savings goal
 *     tags: [Savings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Saving goal ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               targetAmount:
 *                 type: number
 *               currentAmount:
 *                 type: number
 *               category:
 *                 type: string
 *                 enum: [EMERGENCY, VACATION, EDUCATION, HOME, CAR, INVESTMENT, RETIREMENT, OTHER]
 *               priority:
 *                 type: string
 *                 enum: [HIGH, MEDIUM, LOW]
 *               deadline:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *               isCompleted:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Savings goal updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Saving'
 *       404:
 *         description: Savings goal not found
 *       401:
 *         description: Not authorized
 *   delete:
 *     summary: Delete a savings goal
 *     tags: [Savings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Saving goal ID
 *     responses:
 *       200:
 *         description: Savings goal deleted
 *       404:
 *         description: Savings goal not found
 *       401:
 *         description: Not authorized
 */
router.route('/:id')
  .get(protect, getSavingById)
  .put(protect, updateSaving)
  .delete(protect, deleteSaving);

/**
 * @swagger
 * /api/savings/{id}/add:
 *   patch:
 *     summary: Add funds to a savings goal
 *     tags: [Savings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Saving goal ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Amount to add
 *     responses:
 *       200:
 *         description: Funds added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Saving'
 *       400:
 *         description: Invalid amount
 *       404:
 *         description: Savings goal not found
 *       401:
 *         description: Not authorized
 */
router.patch('/:id/add', protect, addToSaving);

/**
 * @swagger
 * /api/savings/{id}/withdraw:
 *   patch:
 *     summary: Withdraw funds from a savings goal
 *     tags: [Savings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Saving goal ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Amount to withdraw
 *     responses:
 *       200:
 *         description: Funds withdrawn successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Saving'
 *       400:
 *         description: Invalid amount
 *       404:
 *         description: Savings goal not found
 *       401:
 *         description: Not authorized
 */
router.patch('/:id/withdraw', protect, withdrawFromSaving);

export default router;

import express from "express";
import {
  registerUser,
  authUser,
  getUserProfile,
  updateUserProfile,
  requestPasswordReset,
  verifyResetOTP,
  resetPassword,
  googleAuth,
  deleteAccount,
  reactivateAccount,
} from "../controllers/authController";
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: User already exists
 */
router.post("/", registerUser);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Authenticate user & get token
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful login
 *       401:
 *         description: Invalid email or password
 */
router.post("/login", authUser);

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *       401:
 *         description: Not authorized
 */
router
  .route("/profile")
  .get(protect, getUserProfile)
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile)
  .delete(protect, deleteAccount);

/**
 * @swagger
 * /api/users/google:
 *   post:
 *     summary: Authenticate with Google
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - credential
 *             properties:
 *               credential:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful login
 *       400:
 *         description: Google authentication failed
 */
router.post("/google", googleAuth);

/**
 * @swagger
 * /api/users/reactivate:
 *   post:
 *     summary: Reactivate a soft-deleted account
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Account reactivated successfully
 *       400:
 *         description: Account is already active or invalid credentials
 */
router.post("/reactivate", reactivateAccount);

/**
 * @swagger
 * /api/users/forgot-password:
 *   post:
 *     summary: Request password reset OTP
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: OTP sent to email if it exists
 *       400:
 *         description: Email is required
 */
router.post("/forgot-password", requestPasswordReset);

/**
 * @swagger
 * /api/users/verify-reset-otp:
 *   post:
 *     summary: Verify password reset OTP
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: Invalid or expired OTP
 */
router.post("/verify-reset-otp", verifyResetOTP);

/**
 * @swagger
 * /api/users/reset-password:
 *   post:
 *     summary: Reset password with OTP
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               otp:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 format: password
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid input or OTP
 */
router.post("/reset-password", resetPassword);

export default router;

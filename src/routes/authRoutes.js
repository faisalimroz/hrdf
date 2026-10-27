import express from 'express';
import {
  register,
  login,
  sendMagicLink,
  verifyMagicLink,
  forgotPassword,
  resetPassword,
  updatePassword,
  getMe,
} from '../controllers/authController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public Authentication Endpoints
router.post('/register', register);
router.post('/login', login);
router.post('/magic-link', sendMagicLink);
router.get('/verify-magic-link', verifyMagicLink);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Authenticated Endpoints
router.put('/update-password', verifyToken, updatePassword);
router.get('/me', verifyToken, getMe);

export default router;

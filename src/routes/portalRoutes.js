import express from 'express';
import { getDashboardData, updateProfile } from '../controllers/portalController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/dashboard', verifyToken, getDashboardData);
router.put('/profile', verifyToken, updateProfile);

export default router;

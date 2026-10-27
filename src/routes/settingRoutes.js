import express from 'express';
import { getSettings } from '../controllers/paymentController.js';

const router = express.Router();

// GET /api/settings - Fetch active pricing configurations
router.get('/', getSettings);

export default router;

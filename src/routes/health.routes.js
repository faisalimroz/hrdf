import express from 'express';
import mongoose from 'mongoose';
import SiteSetting from '../models/SiteSetting.js';

const router = express.Router();

/**
 * @route   GET /api/health
 * @desc    Check system health, database connection, and site settings status
 * @access  Public
 */
router.get('/', async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  let settings = null;
  try {
    settings = await SiteSetting.findOne().lean();
  } catch (err) {
    // Database or query issue
  }

  res.status(200).json({
    success: true,
    platform: 'Hdfd Foundation (Human Development Forum Bangladesh)',
    timestamp: new Date().toISOString(),
    status: 'operational',
    database: {
      status: dbStatus,
      name: mongoose.connection.name || 'uninitialized',
    },
    settingsLoaded: !!settings,
    activePricing: settings
      ? {
          monthly: settings.sponsorshipMonthlyAmount,
          quarterly: settings.sponsorshipQuarterlyAmount,
          yearly: settings.sponsorshipYearlyAmount,
          currency: settings.currency,
        }
      : null,
  });
});

export default router;

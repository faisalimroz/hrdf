import dotenv from 'dotenv';
import mongoose from 'mongoose';
import SiteSetting from '../models/SiteSetting.js';
import { connectDB } from '../config/db.js';

dotenv.config();

/**
 * Seed default site settings if they do not exist
 */
export const seedSiteSettings = async () => {
  try {
    const setting = await SiteSetting.seedDefaultSettings();
    return setting;
  } catch (error) {
    console.error(`[SiteSetting Seed Error]: ${error.message}`);
    throw error;
  }
};

// Standalone execution script
const runStandalone = async () => {
  try {
    await connectDB();
    await seedSiteSettings();
    console.log('[Seed] Standalone SiteSettings seed executed successfully.');
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('[Seed] Standalone execution failed:', err);
    process.exit(1);
  }
};

// Check if file is being run directly from CLI
if (process.argv[1] && process.argv[1].endsWith('siteSettingSeed.js')) {
  runStandalone();
}

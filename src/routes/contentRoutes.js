import express from 'express';
import {
  getBlogs,
  getBlogBySlug,
  getInitiatives,
  getReports,
  getCareers,
} from '../controllers/contentController.js';

const router = express.Router();

// Public Content Endpoints
router.get('/blogs', getBlogs);
router.get('/blogs/:slug', getBlogBySlug);
router.get('/initiatives', getInitiatives);
router.get('/reports', getReports);
router.get('/careers', getCareers);

export default router;

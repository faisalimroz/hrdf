import express from 'express';
import {
  getBlogs,
  getBlogBySlug,
  getInitiatives,
  getInitiativeById,
  getReports,
  getCareers,
  getCareerById,
  applyForCareer,
  getSchoolBranches,
} from '../controllers/contentController.js';

const router = express.Router();

// Public Content Endpoints
router.get('/blogs', getBlogs);
router.get('/blogs/:slug', getBlogBySlug);
router.get('/initiatives', getInitiatives);
router.get('/initiatives/:id', getInitiativeById);
router.get('/reports', getReports);
router.get('/careers', getCareers);
router.get('/careers/:id', getCareerById);
router.post('/careers/:id/apply', applyForCareer);
router.get('/jobs', getCareers);
router.get('/jobs/:id', getCareerById);
router.post('/jobs/:id/apply', applyForCareer);
router.get('/schools', getSchoolBranches);

export default router;

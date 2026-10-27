import express from 'express';
import { requireAdmin } from '../middlewares/adminMiddleware.js';
import {
  getAnalytics,
  getUsers,
  toggleUserStatus,
  deleteUser,
  createChild,
  updateChild,
  deleteChild,
  getChildHistory,
  createBlog,
  updateBlog,
  deleteBlog,
  getAdminNews,
  createNews,
  updateNews,
  deleteNews,
  createInitiative,
  updateInitiative,
  deleteInitiative,
  getAdminSettings,
  updateAdminSettings,
  getAdminDonations,
} from '../controllers/adminController.js';

const router = express.Router();

// Apply requireAdmin to all routes in this router
router.use(requireAdmin);

// 1. Analytics Overview
router.get('/analytics', getAnalytics);

// 2. User Management
router.get('/users', getUsers);
router.put('/users/:id/status', toggleUserStatus);
router.delete('/users/:id', deleteUser);

// 3. Children Roster CMS
router.post('/children', createChild);
router.put('/children/:id', updateChild);
router.delete('/children/:id', deleteChild);
router.get('/children/:id/history', getChildHistory);

// 4. Blogs & News CMS
router.post('/blogs', createBlog);
router.put('/blogs/:id', updateBlog);
router.delete('/blogs/:id', deleteBlog);

// 4B. News CMS
router.get('/news', getAdminNews);
router.post('/news', createNews);
router.put('/news/:id', updateNews);
router.delete('/news/:id', deleteNews);

// 5. Initiatives CMS
router.post('/initiatives', createInitiative);
router.put('/initiatives/:id', updateInitiative);
router.delete('/initiatives/:id', deleteInitiative);

// 6. Settings & Dynamic Pricing
router.get('/settings', getAdminSettings);
router.put('/settings', updateAdminSettings);

// 7. Donations & Transaction Audits
router.get('/donations', getAdminDonations);

export default router;

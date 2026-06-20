import express from 'express';
import { isAuth } from '../middleware/auth.js';
import { isAdmin } from '../middleware/isAdmin.js';
import {
  getUsers,
  banUser,
  getTeams,
  deleteTeam,
  getReports,
  updateReport,
  getAnalytics,
} from '../controllers/adminController.js';

const router = express.Router();

// Apply auth and admin check middlewares globally to these routes
router.use(isAuth);
router.use(isAdmin);

router.get('/users', getUsers);
router.put('/users/:id/ban', banUser);
router.get('/teams', getTeams);
router.delete('/teams/:id', deleteTeam);
router.get('/reports', getReports);
router.put('/reports/:id', updateReport);
router.get('/analytics', getAnalytics);

export default router;

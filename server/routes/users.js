import express from 'express';
import {
  getMe,
  completeOnboarding,
  updateMe,
  getGithubStats,
  getUserProfile,
  getDiscoverUsers,
  searchUsers,
} from '../controllers/userController.js';
import { isAuth } from '../middleware/auth.js';

const router = express.Router();

// Protected routes
router.get('/', isAuth, getDiscoverUsers);
router.get('/search', isAuth, searchUsers);
router.get('/me', isAuth, getMe);
router.put('/onboarding', isAuth, completeOnboarding);
router.put('/me', isAuth, updateMe);
router.get('/github-stats/:username', isAuth, getGithubStats);
router.get('/:id', isAuth, getUserProfile);

export default router;

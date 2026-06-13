import express from 'express';
import { getFeed, createSwipe, getInterestedInMe } from '../controllers/swipeController.js';
import { isAuth } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.get('/feed', isAuth, getFeed);
router.post('/', isAuth, createSwipe);
router.get('/interested-in-me', isAuth, getInterestedInMe);

export default router;

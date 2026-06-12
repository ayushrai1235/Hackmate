import express from 'express';
import passport from 'passport';
import {
  register,
  login,
  refresh,
  logout,
  getMe,
  oauthCallback,
} from '../controllers/authController.js';
import { isAuth } from '../middleware/auth.js';

const router = express.Router();

// Local Auth
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', isAuth, getMe);

// Google OAuth
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  oauthCallback
);

// GitHub OAuth
router.get(
  '/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

router.get(
  '/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: '/login' }),
  oauthCallback
);

export default router;

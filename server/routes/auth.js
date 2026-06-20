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

const getClientUrl = () => {
  let url = process.env.CLIENT_URL || '';
  if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }
  return url.replace(/\/$/, '');
};

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
  (req, res, next) => {
    passport.authenticate('google', { session: false, failureRedirect: `${getClientUrl()}/login?error=auth_failed` })(req, res, next);
  },
  oauthCallback
);

// GitHub OAuth
router.get(
  '/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

router.get(
  '/github/callback',
  (req, res, next) => {
    passport.authenticate('github', { session: false, failureRedirect: `${getClientUrl()}/login?error=auth_failed` })(req, res, next);
  },
  oauthCallback
);

export default router;

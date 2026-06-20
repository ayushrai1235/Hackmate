import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      passwordHash,
      onboardingComplete: false,
    });

    if (user) {
      const accessToken = generateAccessToken(user._id);
      generateRefreshToken(res, user._id);

      res.status(201).json({
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          onboardingComplete: user.onboardingComplete,
        },
        token: accessToken,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Auth user & get tokens
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && user.passwordHash && (await bcrypt.compare(password, user.passwordHash))) {
      if (user.isBanned) {
        return res.status(403).json({ message: 'Your account has been banned' });
      }
      const accessToken = generateAccessToken(user._id);
      generateRefreshToken(res, user._id);

      res.json({
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          onboardingComplete: user.onboardingComplete,
          role: user.role,
        },
        token: accessToken,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
export const refresh = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Not authorized, no refresh token' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Issue a new access token
    const accessToken = generateAccessToken(decoded.id);
    
    res.json({ token: accessToken });
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
export const logout = (req, res) => {
  res.cookie('refreshToken', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      const unreadCount = await Notification.countDocuments({ receiver: req.user._id, isRead: false });
      res.json({ user, unreadCount });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    OAuth Callback Handler
// @route   GET /api/auth/google/callback OR /api/auth/github/callback
// @access  Public
export const oauthCallback = (req, res) => {
  if (!req.user) {
    return res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
  }

  if (req.user.isBanned) {
    return res.redirect(`${process.env.CLIENT_URL}/login?error=user_banned`);
  }

  // Generate tokens
  generateRefreshToken(res, req.user._id);
  const accessToken = generateAccessToken(req.user._id);

  // Determine redirect based on onboarding
  const redirectUrl = req.user.onboardingComplete ? '/discover' : '/onboarding';
  
  // We can pass the access token in the URL hash, query params, or set it in a cookie.
  // Passing via cookie is safer than URL, but since frontend expects it, let's pass via query string temporarily 
  // or use a short-lived cookie that frontend can read and clear.
  // Let's pass it via URL query string for simplicity in OAuth flow.
  res.redirect(`${process.env.CLIENT_URL}${redirectUrl}?token=${accessToken}`);
};

import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const isAuth = async (req, res, next) => {
  let token;

  // Check header for Bearer token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } 
  // Alternatively, check cookies if token is passed there (some setups prefer this)
  else if (req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-passwordHash');
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

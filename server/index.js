import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Try loading .env.local first, fallback to .env
if (fs.existsSync(path.resolve('.env.local'))) {
  dotenv.config({ path: '.env.local' });
} else {
  dotenv.config();
}

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import passport from 'passport';

import connectDB from './config/db.js';
import initSocket from './socket/index.js';
import './config/passport.js'; // Initialize passport strategies

import authRoutes from './routes/auth.js';

// Initialize database connection
connectDB();

const app = express();
const server = http.createServer(app);

// Configure Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Attach socket initialization
initSocket(io);

// Express Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window`
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Make io accessible in routers if needed
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);

// Basic Route for testing
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Server is running' });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

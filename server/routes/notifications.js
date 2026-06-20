import express from 'express';
import {
  getNotifications,
  markRead,
  markAllRead,
} from '../controllers/notificationController.js';
import { isAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(isAuth);

router.get('/', getNotifications);
router.put('/read-all', markAllRead);
router.put('/:id/read', markRead);

export default router;

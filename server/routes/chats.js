import express from 'express';
import { getChats, getMessages, sendMessage } from '../controllers/chatController.js';
import { isAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', isAuth, getChats);
router.get('/:id/messages', isAuth, getMessages);
router.post('/:id/messages', isAuth, sendMessage);

export default router;

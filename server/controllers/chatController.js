import { Chat, Message, User } from '../models/index.js';

/**
 * Get all chats for the logged in user
 * GET /api/chats
 */
export const getChats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all chats where user is a participant
    const chats = await Chat.find({ participants: userId })
      .sort({ lastActivity: -1 })
      .populate('participants', 'name avatar status lastActive')
      .populate({
        path: 'teamId',
        select: 'name logo members',
      })
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'name avatar' },
      });

    // Compute unread message counts for all chats in a single database query
    const chatIds = chats.map((chat) => chat._id);
    const unreadCounts = await Message.aggregate([
      {
        $match: {
          chatId: { $in: chatIds },
          sender: { $ne: userId },
          readBy: { $ne: userId },
        },
      },
      {
        $group: {
          _id: '$chatId',
          count: { $sum: 1 },
        },
      },
    ]);

    const unreadMap = {};
    unreadCounts.forEach((uc) => {
      unreadMap[uc._id.toString()] = uc.count;
    });

    const chatList = chats.map((chat) => {
      return {
        ...chat.toObject(),
        unreadCount: unreadMap[chat._id.toString()] || 0,
      };
    });

    return res.status(200).json({ chats: chatList });
  } catch (error) {
    console.error('getChats error:', error);
    return res.status(500).json({ message: 'Error fetching chats', error: error.message });
  }
};

/**
 * Get messages in a chat (paginated using cursor before)
 * GET /api/chats/:id/messages
 */
export const getMessages = async (req, res) => {
  try {
    const chatId = req.params.id;
    const userId = req.user._id;
    const { before, limit = 20 } = req.query;

    // Verify participant
    const chat = await Chat.findOne({ _id: chatId, participants: userId });
    if (!chat) {
      return res.status(403).json({ message: 'Access denied. You are not in this chat.' });
    }

    const query = { chatId };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('sender', 'name avatar');

    // Update unread messages to marked as read and delivered by this user
    await Message.updateMany(
      {
        chatId,
        sender: { $ne: userId },
        $or: [
          { readBy: { $ne: userId } },
          { deliveredTo: { $ne: userId } }
        ]
      },
      { 
        $addToSet: { 
          readBy: userId,
          deliveredTo: userId 
        } 
      }
    );

    const oldestMessage = messages[messages.length - 1];
    const reversed = [...messages].reverse();

    return res.status(200).json({
      messages: reversed,
      nextCursor: oldestMessage ? oldestMessage.createdAt : null,
      hasMore: messages.length === parseInt(limit),
    });
  } catch (error) {
    console.error('getMessages error:', error);
    return res.status(500).json({ message: 'Error fetching messages', error: error.message });
  }
};

/**
 * Fallback to send message via HTTP (also emits to sockets)
 * POST /api/chats/:id/messages
 */
export const sendMessage = async (req, res) => {
  try {
    const chatId = req.params.id;
    const userId = req.user._id;
    const { content, attachments } = req.body;

    // Verify participant
    const chat = await Chat.findOne({ _id: chatId, participants: userId });
    if (!chat) {
      return res.status(403).json({ message: 'Access denied. You are not in this chat.' });
    }

    let message = await Message.create({
      chatId,
      sender: userId,
      content,
      attachments: attachments || [],
      readBy: [userId],
    });

    message = await message.populate('sender', 'name avatar');

    // Update Chat lastActivity & lastMessage
    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: message._id,
      lastActivity: new Date(),
    });

    // Notify sockets
    const io = req.app.get('io');
    if (io) {
      io.to(chatId).emit('message:new', message);
    }

    return res.status(201).json({ message });
  } catch (error) {
    console.error('sendMessage error:', error);
    return res.status(500).json({ message: 'Error sending message', error: error.message });
  }
};

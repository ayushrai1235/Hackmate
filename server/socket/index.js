import jwt from 'jsonwebtoken';
import { User, Message, Chat } from '../models/index.js';

// Map of userId -> Set of socket IDs for targeted emissions
const onlineUsers = new Map();

/**
 * Emit an event to a specific user's room.
 * Usage: emitToUser(io, userId, 'event:name', payload)
 */
export const emitToUser = (io, userId, event, data) => {
  io.to(`user:${userId}`).emit(event, data);
};

const initSocket = (io) => {
  // Authentication middleware for Socket.IO connection
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      console.warn('Socket connection rejected: No token provided');
      return next(new Error('Authentication error: No token provided'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      console.error('Socket connection rejected: Invalid token', err.message);
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.userId;

    if (userId) {
      // Join user-specific room
      socket.join(`user:${userId}`);

      // Track online users
      const wasOffline = !onlineUsers.has(userId) || onlineUsers.get(userId).size === 0;
      if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, new Set());
      }
      onlineUsers.get(userId).add(socket.id);

      console.log(`User ${userId} connected via socket: ${socket.id}`);

      // If this is the user's first socket connection, set presence to Online and notify everyone
      if (wasOffline) {
        try {
          const now = new Date();
          await User.findByIdAndUpdate(userId, {
            status: 'Online',
            lastActive: now,
          });
          io.emit('user:status', {
            userId,
            status: 'Online',
            lastActive: now,
          });

          // Mark all undelivered messages in user's chats as delivered
          const chats = await Chat.find({ participants: userId });
          const chatIds = chats.map((c) => c._id);
          
          const undelivered = await Message.find({
            chatId: { $in: chatIds },
            sender: { $ne: userId },
            deliveredTo: { $ne: userId },
          });

          if (undelivered.length > 0) {
            const undeliveredIds = undelivered.map((m) => m._id);
            await Message.updateMany(
              { _id: { $in: undeliveredIds } },
              { $addToSet: { deliveredTo: userId } }
            );

            // Group by chatId to emit delivery receipt updates
            const chatToMsgMap = {};
            undelivered.forEach((msg) => {
              const cId = msg.chatId.toString();
              if (!chatToMsgMap[cId]) chatToMsgMap[cId] = [];
              chatToMsgMap[cId].push(msg._id.toString());
            });

            for (const [cId, msgIds] of Object.entries(chatToMsgMap)) {
              io.to(cId).emit('messages:delivered', {
                chatId: cId,
                messageIds: msgIds,
                userId,
              });
            }
          }
        } catch (err) {
          console.error('Error updating presence/delivery on connection:', err);
        }
      }

      // ── Chat room events ──
      socket.on('join:chat', ({ chatId }) => {
        if (chatId) {
          socket.join(chatId);
          console.log(`Socket ${socket.id} (user: ${userId}) joined room ${chatId}`);
        }
      });

      socket.on('message:send', async ({ chatId, content, attachments, tempId }) => {
        try {
          if (!chatId) return;

          // Check online participants in this chat to compute delivery status immediately
          const chat = await Chat.findById(chatId);
          const deliveredTo = [userId]; // Sender always gets it
          
          if (chat) {
            chat.participants.forEach((pId) => {
              const pIdStr = pId.toString();
              if (
                pIdStr !== userId &&
                onlineUsers.has(pIdStr) &&
                onlineUsers.get(pIdStr).size > 0
              ) {
                deliveredTo.push(pId);
              }
            });
          }

          // Save Message to DB
          let message = await Message.create({
            chatId,
            sender: userId,
            content,
            attachments: attachments || [],
            readBy: [userId], // Sender has already read it
            deliveredTo,
          });

          // Populate sender info
          message = await message.populate('sender', 'name avatar');

          // Update Chat lastActivity and lastMessage
          await Chat.findByIdAndUpdate(chatId, {
            lastMessage: message._id,
            lastActivity: new Date(),
          });

          // Emit to all users in the chat room (include tempId for sender alignment)
          io.to(chatId).emit('message:new', { message, tempId });
        } catch (err) {
          console.error('Error processing message:send via socket:', err);
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      socket.on('typing:start', ({ chatId }) => {
        if (chatId) {
          socket.to(chatId).emit('typing:start', { chatId, userId });
        }
      });

      socket.on('typing:stop', ({ chatId }) => {
        if (chatId) {
          socket.to(chatId).emit('typing:stop', { chatId, userId });
        }
      });

      // Mark all unread messages in a chat as read by this user
      socket.on('chat:read', async ({ chatId }) => {
        try {
          if (!chatId) return;

          const unreadMessages = await Message.find({
            chatId,
            sender: { $ne: userId },
            readBy: { $ne: userId },
          });

          if (unreadMessages.length > 0) {
            const messageIds = unreadMessages.map((m) => m._id);
            await Message.updateMany(
              { _id: { $in: messageIds } },
              { 
                $addToSet: { 
                  readBy: userId,
                  deliveredTo: userId 
                } 
              }
            );

            io.to(chatId).emit('chat:read', {
              chatId,
              userId,
              messageIds,
            });
          }
        } catch (err) {
          console.error('Error processing chat:read via socket:', err);
        }
      });

      socket.on('message:read', async ({ messageId }) => {
        try {
          if (!messageId) return;

          const message = await Message.findByIdAndUpdate(
            messageId,
            { $addToSet: { readBy: userId, deliveredTo: userId } },
            { new: true }
          );

          if (message) {
            io.to(message.chatId.toString()).emit('message:read', {
              messageId,
              chatId: message.chatId,
              readBy: message.readBy,
            });
          }
        } catch (err) {
          console.error('Error processing message:read via socket:', err);
        }
      });
    } else {
      console.log(`Anonymous socket connected: ${socket.id}`);
    }

    // Handle disconnection
    socket.on('disconnect', async () => {
      if (userId) {
        const userSockets = onlineUsers.get(userId);
        if (userSockets) {
          userSockets.delete(socket.id);
          if (userSockets.size === 0) {
            onlineUsers.delete(userId);

            // User has completely disconnected all tabs/sessions
            try {
              const now = new Date();
              await User.findByIdAndUpdate(userId, {
                status: 'Offline',
                lastActive: now,
              });
              io.emit('user:status', {
                userId,
                status: 'Offline',
                lastActive: now,
              });
              console.log(`User ${userId} went offline completely`);
            } catch (err) {
              console.error('Error updating presence on disconnect:', err);
            }
          }
        }
        console.log(`User ${userId} socket disconnected: ${socket.id}`);
      } else {
        console.log(`Anonymous socket disconnected: ${socket.id}`);
      }
    });
  });
};

export default initSocket;

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
  io.on('connection', (socket) => {
    const userId = socket.handshake.auth?.userId || socket.handshake.query?.userId;

    if (userId) {
      // Join user-specific room
      socket.join(`user:${userId}`);

      // Track online users
      if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, new Set());
      }
      onlineUsers.get(userId).add(socket.id);

      console.log(`User ${userId} connected via socket: ${socket.id}`);
    } else {
      console.log(`Anonymous socket connected: ${socket.id}`);
    }

    // Handle disconnection
    socket.on('disconnect', () => {
      if (userId) {
        const userSockets = onlineUsers.get(userId);
        if (userSockets) {
          userSockets.delete(socket.id);
          if (userSockets.size === 0) {
            onlineUsers.delete(userId);
          }
        }
        console.log(`User ${userId} disconnected: ${socket.id}`);
      } else {
        console.log(`Anonymous socket disconnected: ${socket.id}`);
      }
    });
  });
};

export default initSocket;

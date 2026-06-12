const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected via socket: ${socket.id}`);

    // Basic event stub
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};

module.exports = initSocket;

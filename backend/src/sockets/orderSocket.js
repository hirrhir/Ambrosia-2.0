let io;

const initSocket = (server) => {
  const { Server } = require('socket.io');
  io = new Server(server, {
    cors: { origin: '*' }, // fine for dev; tighten for production
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

const emitOrderUpdate = (order) => {
  if (io) {
    io.emit('orderUpdated', order);
  }
};

module.exports = { initSocket, emitOrderUpdate };
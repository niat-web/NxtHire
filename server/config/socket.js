const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let io;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === 'production'
        ? process.env.CLIENT_URL
        : ['http://localhost:3000', 'http://localhost:5173', process.env.CLIENT_URL].filter(Boolean),
      credentials: true,
    },
  });

  // Auth middleware — verify JWT on connection
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('No token'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('_id role firstName lastName');
      if (!user) return next(new Error('User not found'));
      socket.user = user;
      next();
    } catch {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    // Join role-based room
    socket.join(socket.user.role);
    console.log(`Socket connected: ${socket.user.firstName} (${socket.user.role})`);

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.user.firstName}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

module.exports = { initSocket, getIO };

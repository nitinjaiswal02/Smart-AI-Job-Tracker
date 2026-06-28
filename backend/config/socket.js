import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

let io; // we'll export this so controllers can emit events

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  // Socket.io middleware — runs before every connection is accepted.
  // We verify the JWT here (same logic as our HTTP protect middleware)
  // so that anonymous WebSocket connections are rejected immediately.
  // The token comes from the client as a handshake "auth" parameter.
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user) {
        return next(new Error('User not found'));
      }

      // Attach user to the socket object — accessible in all event handlers
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    // Each user joins a room named after their own userId.
    // This is how we send targeted events to specific users later —
    // io.to(userId).emit(...) reaches ONLY that user's connected sockets.
    const userId = socket.user._id.toString();
    socket.join(userId);

    console.log(`Socket connected: ${socket.user.name} (${socket.id})`);

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.user.name} (${socket.id})`);
    });
  });

  return io;
};

// Exported so any controller can call:
// getIO().to(userId).emit('eventName', data)
const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

export { initSocket, getIO };
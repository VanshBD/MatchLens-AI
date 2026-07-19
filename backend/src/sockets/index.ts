import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { env } from '../config/env';
import { authService } from '../services/auth.service';
import { SOCKET_EVENTS } from '../constants';
import { logger } from '../config/logger';

interface AuthenticatedSocket {
  userId: string;
  role: string;
  name: string;
}

const userRooms = new Map<string, string>(); // socketId -> userId

export function initializeSocket(httpServer: HttpServer): SocketServer {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Auth middleware for Socket.IO
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const payload = authService.verifyAccessToken(token);
      (socket as unknown as { user: AuthenticatedSocket }).user = {
        userId: payload.userId,
        role: payload.role,
        name: '',
      };

      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const user = (socket as unknown as { user: AuthenticatedSocket }).user;
    logger.info('Socket connected', { socketId: socket.id, userId: user.userId });

    userRooms.set(socket.id, user.userId);

    // Auto-join role-based room
    socket.join(`role:${user.role}`);
    socket.join(`user:${user.userId}`);

    // Join custom room
    socket.on(SOCKET_EVENTS.JOIN_ROOM, (room: string) => {
      socket.join(room);
      logger.info('Socket joined room', { socketId: socket.id, room });
    });

    socket.on(SOCKET_EVENTS.LEAVE_ROOM, (room: string) => {
      socket.leave(room);
    });

    socket.on('disconnect', (reason) => {
      userRooms.delete(socket.id);
      logger.info('Socket disconnected', { socketId: socket.id, reason });
    });

    socket.on('error', (error) => {
      logger.error('Socket error', { socketId: socket.id, error: error.message });
    });
  });

  return io;
}

// Helper to emit to specific role
export function emitToRole(io: SocketServer, role: string, event: string, data: unknown) {
  io.to(`role:${role}`).emit(event, data);
}

// Helper to emit to specific user
export function emitToUser(io: SocketServer, userId: string, event: string, data: unknown) {
  io.to(`user:${userId}`).emit(event, data);
}

// Helper to broadcast incident updates
export function broadcastIncidentUpdate(
  io: SocketServer,
  event: string,
  incident: unknown
) {
  io.emit(event, incident);
}

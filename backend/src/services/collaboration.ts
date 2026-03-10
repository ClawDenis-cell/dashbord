import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyToken } from '../middleware/auth';
import { DocumentModel } from '../models/documents';

interface ConnectedUser {
  userId: string;
  username: string;
  socketId: string;
  documentId: string;
  cursor?: { line: number; ch: number };
}

const connectedUsers: Map<string, ConnectedUser[]> = new Map();

export function setupSocketIO(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    path: '/socket.io',
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const payload = verifyToken(token);
      (socket as any).userId = payload.userId;
      (socket as any).userEmail = payload.email;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId;

    socket.on('join-document', async (data: { documentId: string; username: string }) => {
      const { documentId, username } = data;

      // Check access
      const access = await DocumentModel.canAccess(documentId, userId);
      if (!access) {
        socket.emit('error', { message: 'No access to this document' });
        return;
      }

      socket.join(`doc:${documentId}`);

      // Track connected user
      const users = connectedUsers.get(documentId) || [];
      const existing = users.findIndex(u => u.userId === userId);
      if (existing >= 0) {
        users[existing].socketId = socket.id;
      } else {
        users.push({ userId, username, socketId: socket.id, documentId });
      }
      connectedUsers.set(documentId, users);

      // Notify others
      socket.to(`doc:${documentId}`).emit('user-joined', {
        userId,
        username,
        users: users.map(u => ({ userId: u.userId, username: u.username })),
      });

      // Send current users to the joining user
      socket.emit('current-users', {
        users: users.map(u => ({ userId: u.userId, username: u.username, cursor: u.cursor })),
        access,
      });
    });

    socket.on('content-change', (data: { documentId: string; content: string; changes: any }) => {
      socket.to(`doc:${data.documentId}`).emit('content-update', {
        userId,
        content: data.content,
        changes: data.changes,
      });
    });

    socket.on('cursor-move', (data: { documentId: string; cursor: { line: number; ch: number } }) => {
      const users = connectedUsers.get(data.documentId);
      if (users) {
        const user = users.find(u => u.userId === userId);
        if (user) user.cursor = data.cursor;
      }

      socket.to(`doc:${data.documentId}`).emit('cursor-update', {
        userId,
        cursor: data.cursor,
      });
    });

    socket.on('save-document', async (data: { documentId: string; content: string; title?: string }) => {
      try {
        const access = await DocumentModel.canAccess(data.documentId, userId);
        if (access === 'read') {
          socket.emit('save-error', { message: 'Read-only access' });
          return;
        }

        const updateData: any = { content: data.content };
        if (data.title) updateData.title = data.title;

        await DocumentModel.update(data.documentId, updateData);

        socket.emit('save-success', { documentId: data.documentId });
        socket.to(`doc:${data.documentId}`).emit('document-saved', {
          userId,
          documentId: data.documentId,
        });
      } catch (error) {
        socket.emit('save-error', { message: 'Failed to save' });
      }
    });

    socket.on('leave-document', (data: { documentId: string }) => {
      leaveDocument(socket, userId, data.documentId);
    });

    socket.on('disconnect', () => {
      // Remove from all documents
      connectedUsers.forEach((users, documentId) => {
        leaveDocument(socket, userId, documentId);
      });
    });
  });

  function leaveDocument(socket: Socket, userId: string, documentId: string) {
    socket.leave(`doc:${documentId}`);

    const users = connectedUsers.get(documentId);
    if (users) {
      const idx = users.findIndex(u => u.userId === userId);
      if (idx >= 0) {
        const removed = users.splice(idx, 1)[0];
        if (users.length === 0) {
          connectedUsers.delete(documentId);
        } else {
          connectedUsers.set(documentId, users);
        }

        socket.to(`doc:${documentId}`).emit('user-left', {
          userId,
          username: removed.username,
          users: users.map(u => ({ userId: u.userId, username: u.username })),
        });
      }
    }
  }

  return io;
}

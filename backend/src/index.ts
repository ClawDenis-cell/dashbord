import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer } from 'http';
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import ticketRoutes from './routes/tickets';
import todoRoutes from './routes/todos';
import kanbanConfigRoutes from './routes/kanbanConfig';
import kanbanBoardRoutes from './routes/kanbanBoards';
import userSettingsRoutes from './routes/userSettings';
import documentRoutes from './routes/documents';
import pdfRoutes from './routes/pdf';
import { authMiddleware } from './middleware/auth';
import { setupSocketIO } from './services/collaboration';

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3001;

// Setup Socket.IO for collaboration
setupSocketIO(httpServer);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Static file serving for uploads
app.use('/uploads', express.static(path.join(process.env.UPLOAD_DIR || '/app/uploads')));

// Public routes
app.use('/api/auth', authRoutes);

// Health check (public)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Protected routes
app.use('/api/projects', authMiddleware, projectRoutes);
app.use('/api/tickets', authMiddleware, ticketRoutes);
app.use('/api/todos', authMiddleware, todoRoutes);
app.use('/api/kanban-config', authMiddleware, kanbanConfigRoutes);
app.use('/api/kanban-boards', authMiddleware, kanbanBoardRoutes);
app.use('/api/users', authMiddleware, userSettingsRoutes);
app.use('/api/documents', authMiddleware, documentRoutes);
app.use('/api/pdf', authMiddleware, pdfRoutes);

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

export { app };

// Only start the server when not in test mode
if (process.env.NODE_ENV !== 'test') {
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

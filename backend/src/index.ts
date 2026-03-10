import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import ticketRoutes from './routes/tickets';
import todoRoutes from './routes/todos';
import kanbanConfigRoutes from './routes/kanbanConfig';
import { authMiddleware } from './middleware/auth';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

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

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

export { app };

// Only start the server when not in test mode
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

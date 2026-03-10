import express from 'express';
import cors from 'cors';
import projectRoutes from './routes/projects';
import ticketRoutes from './routes/tickets';
import todoRoutes from './routes/todos';
import kanbanConfigRoutes from './routes/kanbanConfig';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/projects', projectRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/kanban-config', kanbanConfigRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

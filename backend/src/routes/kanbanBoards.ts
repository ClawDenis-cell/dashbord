import { Router } from 'express';
import { KanbanBoardController } from '../controllers/kanbanBoards';

const router = Router();

// GET /api/kanban-boards?projectId={id} - Get all boards for a project
router.get('/', KanbanBoardController.getByProject);

// GET /api/kanban-boards/:id - Get single board
router.get('/:id', KanbanBoardController.getById);

// POST /api/kanban-boards - Create new board
router.post('/', KanbanBoardController.create);

// PUT /api/kanban-boards/:id - Update board
router.put('/:id', KanbanBoardController.update);

// DELETE /api/kanban-boards/:id - Delete board
router.delete('/:id', KanbanBoardController.delete);

export default router;
import { Request, Response } from 'express';
import { KanbanBoardModel } from '../models/kanbanBoards';

export const KanbanBoardController = {
  async getByProject(req: Request, res: Response) {
    try {
      const { projectId } = req.query;
      if (!projectId) {
        return res.status(400).json({ error: 'Project ID is required as query parameter' });
      }
      const boards = await KanbanBoardModel.findByProjectId(projectId as string);
      res.json(boards);
    } catch (error) {
      console.error('Error fetching kanban boards:', error);
      res.status(500).json({ error: 'Failed to fetch kanban boards' });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const board = await KanbanBoardModel.findById(id);
      
      if (!board) {
        return res.status(404).json({ error: 'Kanban board not found' });
      }
      
      res.json(board);
    } catch (error) {
      console.error('Error fetching kanban board:', error);
      res.status(500).json({ error: 'Failed to fetch kanban board' });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { name, project_id, columns_array } = req.body;
      
      if (!name || name.trim().length === 0) {
        return res.status(400).json({ error: 'Board name is required' });
      }
      
      if (!project_id) {
        return res.status(400).json({ error: 'Project ID is required' });
      }
      
      if (columns_array && (!Array.isArray(columns_array) || columns_array.length === 0)) {
        return res.status(400).json({ error: 'columns_array must be a non-empty array' });
      }
      
      const board = await KanbanBoardModel.create({ name, project_id, columns_array });
      res.status(201).json(board);
    } catch (error) {
      console.error('Error creating kanban board:', error);
      res.status(500).json({ error: 'Failed to create kanban board' });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, columns_array } = req.body;
      
      const board = await KanbanBoardModel.update(id, { name, columns_array });
      
      if (!board) {
        return res.status(404).json({ error: 'Kanban board not found' });
      }
      
      res.json(board);
    } catch (error) {
      console.error('Error updating kanban board:', error);
      res.status(500).json({ error: 'Failed to update kanban board' });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Check if this is the last board for the project
      const board = await KanbanBoardModel.findById(id);
      if (!board) {
        return res.status(404).json({ error: 'Kanban board not found' });
      }
      
      const boardCount = await KanbanBoardModel.countByProjectId(board.project_id);
      if (boardCount <= 1) {
        return res.status(400).json({ error: 'Cannot delete the last board of a project' });
      }
      
      const deleted = await KanbanBoardModel.delete(id);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Kanban board not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting kanban board:', error);
      res.status(500).json({ error: 'Failed to delete kanban board' });
    }
  }
};
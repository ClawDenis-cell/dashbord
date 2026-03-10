import { Request, Response } from 'express';
import { KanbanConfigModel } from '../models/kanbanConfig';

export const KanbanConfigController = {
  async getConfig(req: Request, res: Response) {
    try {
      const { userId = 'default' } = req.query;
      let config = await KanbanConfigModel.findByUserId(userId as string);
      
      // If no config exists, create default one
      if (!config) {
        config = await KanbanConfigModel.create({ user_id: userId as string });
      }
      
      res.json(config);
    } catch (error) {
      console.error('Error fetching kanban config:', error);
      res.status(500).json({ error: 'Failed to fetch kanban config' });
    }
  },

  async getAll(req: Request, res: Response) {
    try {
      const configs = await KanbanConfigModel.findAll();
      res.json(configs);
    } catch (error) {
      console.error('Error fetching kanban configs:', error);
      res.status(500).json({ error: 'Failed to fetch kanban configs' });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { board_name, columns_array, user_id } = req.body;
      
      if (!columns_array || !Array.isArray(columns_array) || columns_array.length === 0) {
        return res.status(400).json({ error: 'columns_array must be a non-empty array' });
      }
      
      const config = await KanbanConfigModel.create({ board_name, columns_array, user_id });
      res.status(201).json(config);
    } catch (error) {
      console.error('Error creating kanban config:', error);
      res.status(500).json({ error: 'Failed to create kanban config' });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { board_name, columns_array } = req.body;
      const { userId = 'default' } = req.params;
      
      const config = await KanbanConfigModel.update(userId, { board_name, columns_array });
      
      if (!config) {
        return res.status(404).json({ error: 'Kanban config not found' });
      }
      
      res.json(config);
    } catch (error) {
      console.error('Error updating kanban config:', error);
      res.status(500).json({ error: 'Failed to update kanban config' });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const deleted = await KanbanConfigModel.delete(req.params.id);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Kanban config not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting kanban config:', error);
      res.status(500).json({ error: 'Failed to delete kanban config' });
    }
  }
};

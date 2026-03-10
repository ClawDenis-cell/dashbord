import { Request, Response } from 'express';
import { TodoModel } from '../models/todos';

export const TodoController = {
  async getAll(req: Request, res: Response) {
    try {
      const todos = await TodoModel.findAll();
      res.json(todos);
    } catch (error) {
      console.error('Error fetching todos:', error);
      res.status(500).json({ error: 'Failed to fetch todos' });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const todo = await TodoModel.findById(req.params.id);
      if (!todo) {
        return res.status(404).json({ error: 'Todo not found' });
      }
      res.json(todo);
    } catch (error) {
      console.error('Error fetching todo:', error);
      res.status(500).json({ error: 'Failed to fetch todo' });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { title, completed } = req.body;
      
      if (!title || title.trim().length === 0) {
        return res.status(400).json({ error: 'Title is required' });
      }
      
      const todo = await TodoModel.create({ title, completed });
      res.status(201).json(todo);
    } catch (error) {
      console.error('Error creating todo:', error);
      res.status(500).json({ error: 'Failed to create todo' });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { title, completed } = req.body;
      const todo = await TodoModel.update(req.params.id, { title, completed });
      
      if (!todo) {
        return res.status(404).json({ error: 'Todo not found' });
      }
      
      res.json(todo);
    } catch (error) {
      console.error('Error updating todo:', error);
      res.status(500).json({ error: 'Failed to update todo' });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const deleted = await TodoModel.delete(req.params.id);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Todo not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting todo:', error);
      res.status(500).json({ error: 'Failed to delete todo' });
    }
  }
};

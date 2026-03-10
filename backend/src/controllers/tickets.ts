import { Request, Response } from 'express';
import { TicketModel } from '../models/tickets';

export const TicketController = {
  async getAll(req: Request, res: Response) {
    try {
      const tickets = await TicketModel.findAll();
      res.json(tickets);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      res.status(500).json({ error: 'Failed to fetch tickets' });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const ticket = await TicketModel.findById(req.params.id);
      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }
      res.json(ticket);
    } catch (error) {
      console.error('Error fetching ticket:', error);
      res.status(500).json({ error: 'Failed to fetch ticket' });
    }
  },

  async getByProject(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const tickets = await TicketModel.findByProjectId(projectId);
      res.json(tickets);
    } catch (error) {
      console.error('Error fetching project tickets:', error);
      res.status(500).json({ error: 'Failed to fetch tickets' });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { title, description, project_id, status, priority, column_name } = req.body;
      
      if (!title || title.trim().length === 0) {
        return res.status(400).json({ error: 'Title is required' });
      }
      
      const ticket = await TicketModel.create({ 
        title, description, project_id, status, priority, column_name 
      });
      res.status(201).json(ticket);
    } catch (error) {
      console.error('Error creating ticket:', error);
      res.status(500).json({ error: 'Failed to create ticket' });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { title, description, project_id, status, priority, column_name } = req.body;
      const ticket = await TicketModel.update(req.params.id, { 
        title, description, project_id, status, priority, column_name 
      });
      
      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }
      
      res.json(ticket);
    } catch (error) {
      console.error('Error updating ticket:', error);
      res.status(500).json({ error: 'Failed to update ticket' });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const deleted = await TicketModel.delete(req.params.id);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Ticket not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting ticket:', error);
      res.status(500).json({ error: 'Failed to delete ticket' });
    }
  }
};

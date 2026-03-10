import { Request, Response } from 'express';
import { ProjectModel } from '../models/projects';

export const ProjectController = {
  async getAll(req: Request, res: Response) {
    try {
      const projects = await ProjectModel.findAll();
      res.json(projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      res.status(500).json({ error: 'Failed to fetch projects' });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const project = await ProjectModel.findById(req.params.id);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      res.json(project);
    } catch (error) {
      console.error('Error fetching project:', error);
      res.status(500).json({ error: 'Failed to fetch project' });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { name, description, color } = req.body;
      
      if (!name || name.trim().length === 0) {
        return res.status(400).json({ error: 'Name is required' });
      }
      
      const project = await ProjectModel.create({ name, description, color });
      res.status(201).json(project);
    } catch (error) {
      console.error('Error creating project:', error);
      res.status(500).json({ error: 'Failed to create project' });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { name, description, color } = req.body;
      const project = await ProjectModel.update(req.params.id, { 
        name, 
        description, 
        color 
      });
      
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      res.json(project);
    } catch (error) {
      console.error('Error updating project:', error);
      res.status(500).json({ error: 'Failed to update project' });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const deleted = await ProjectModel.delete(req.params.id);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting project:', error);
      res.status(500).json({ error: 'Failed to delete project' });
    }
  }
};

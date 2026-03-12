"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectController = void 0;
const projects_1 = require("../models/projects");
exports.ProjectController = {
    async getAll(req, res) {
        try {
            const projects = await projects_1.ProjectModel.findAll();
            res.json(projects);
        }
        catch (error) {
            console.error('Error fetching projects:', error);
            res.status(500).json({ error: 'Failed to fetch projects' });
        }
    },
    async getById(req, res) {
        try {
            const project = await projects_1.ProjectModel.findById(req.params.id);
            if (!project) {
                return res.status(404).json({ error: 'Project not found' });
            }
            res.json(project);
        }
        catch (error) {
            console.error('Error fetching project:', error);
            res.status(500).json({ error: 'Failed to fetch project' });
        }
    },
    async create(req, res) {
        try {
            const { name, description, color } = req.body;
            if (!name || name.trim().length === 0) {
                return res.status(400).json({ error: 'Name is required' });
            }
            const project = await projects_1.ProjectModel.create({ name, description, color });
            res.status(201).json(project);
        }
        catch (error) {
            console.error('Error creating project:', error);
            res.status(500).json({ error: 'Failed to create project' });
        }
    },
    async update(req, res) {
        try {
            const { name, description, color } = req.body;
            const project = await projects_1.ProjectModel.update(req.params.id, {
                name,
                description,
                color
            });
            if (!project) {
                return res.status(404).json({ error: 'Project not found' });
            }
            res.json(project);
        }
        catch (error) {
            console.error('Error updating project:', error);
            res.status(500).json({ error: 'Failed to update project' });
        }
    },
    async delete(req, res) {
        try {
            const deleted = await projects_1.ProjectModel.delete(req.params.id);
            if (!deleted) {
                return res.status(404).json({ error: 'Project not found' });
            }
            res.status(204).send();
        }
        catch (error) {
            console.error('Error deleting project:', error);
            res.status(500).json({ error: 'Failed to delete project' });
        }
    }
};
//# sourceMappingURL=projects.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TodoController = void 0;
const todos_1 = require("../models/todos");
exports.TodoController = {
    async getAll(req, res) {
        try {
            const todos = await todos_1.TodoModel.findAll();
            res.json(todos);
        }
        catch (error) {
            console.error('Error fetching todos:', error);
            res.status(500).json({ error: 'Failed to fetch todos' });
        }
    },
    async getById(req, res) {
        try {
            const todo = await todos_1.TodoModel.findById(req.params.id);
            if (!todo) {
                return res.status(404).json({ error: 'Todo not found' });
            }
            res.json(todo);
        }
        catch (error) {
            console.error('Error fetching todo:', error);
            res.status(500).json({ error: 'Failed to fetch todo' });
        }
    },
    async create(req, res) {
        try {
            const { title, completed } = req.body;
            if (!title || title.trim().length === 0) {
                return res.status(400).json({ error: 'Title is required' });
            }
            const todo = await todos_1.TodoModel.create({ title, completed });
            res.status(201).json(todo);
        }
        catch (error) {
            console.error('Error creating todo:', error);
            res.status(500).json({ error: 'Failed to create todo' });
        }
    },
    async update(req, res) {
        try {
            const { title, completed } = req.body;
            const todo = await todos_1.TodoModel.update(req.params.id, { title, completed });
            if (!todo) {
                return res.status(404).json({ error: 'Todo not found' });
            }
            res.json(todo);
        }
        catch (error) {
            console.error('Error updating todo:', error);
            res.status(500).json({ error: 'Failed to update todo' });
        }
    },
    async delete(req, res) {
        try {
            const deleted = await todos_1.TodoModel.delete(req.params.id);
            if (!deleted) {
                return res.status(404).json({ error: 'Todo not found' });
            }
            res.status(204).send();
        }
        catch (error) {
            console.error('Error deleting todo:', error);
            res.status(500).json({ error: 'Failed to delete todo' });
        }
    }
};
//# sourceMappingURL=todos.js.map
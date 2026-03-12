"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketController = void 0;
const tickets_1 = require("../models/tickets");
exports.TicketController = {
    async getAll(req, res) {
        try {
            const tickets = await tickets_1.TicketModel.findAll();
            res.json(tickets);
        }
        catch (error) {
            console.error('Error fetching tickets:', error);
            res.status(500).json({ error: 'Failed to fetch tickets' });
        }
    },
    async getById(req, res) {
        try {
            const ticket = await tickets_1.TicketModel.findById(req.params.id);
            if (!ticket) {
                return res.status(404).json({ error: 'Ticket not found' });
            }
            res.json(ticket);
        }
        catch (error) {
            console.error('Error fetching ticket:', error);
            res.status(500).json({ error: 'Failed to fetch ticket' });
        }
    },
    async getByProject(req, res) {
        try {
            const { projectId } = req.params;
            const tickets = await tickets_1.TicketModel.findByProjectId(projectId);
            res.json(tickets);
        }
        catch (error) {
            console.error('Error fetching project tickets:', error);
            res.status(500).json({ error: 'Failed to fetch tickets' });
        }
    },
    async getByBoard(req, res) {
        try {
            const { boardId } = req.params;
            const tickets = await tickets_1.TicketModel.findByBoardId(boardId);
            res.json(tickets);
        }
        catch (error) {
            console.error('Error fetching board tickets:', error);
            res.status(500).json({ error: 'Failed to fetch tickets' });
        }
    },
    async create(req, res) {
        try {
            const { title, description, project_id, board_id, status, priority, column_name } = req.body;
            if (!title || title.trim().length === 0) {
                return res.status(400).json({ error: 'Title is required' });
            }
            const ticket = await tickets_1.TicketModel.create({
                title, description, project_id, board_id, status, priority, column_name
            });
            res.status(201).json(ticket);
        }
        catch (error) {
            console.error('Error creating ticket:', error);
            res.status(500).json({ error: 'Failed to create ticket' });
        }
    },
    async update(req, res) {
        try {
            const { title, description, project_id, board_id, status, priority, column_name } = req.body;
            const ticket = await tickets_1.TicketModel.update(req.params.id, {
                title, description, project_id, board_id, status, priority, column_name
            });
            if (!ticket) {
                return res.status(404).json({ error: 'Ticket not found' });
            }
            res.json(ticket);
        }
        catch (error) {
            console.error('Error updating ticket:', error);
            res.status(500).json({ error: 'Failed to update ticket' });
        }
    },
    async delete(req, res) {
        try {
            const deleted = await tickets_1.TicketModel.delete(req.params.id);
            if (!deleted) {
                return res.status(404).json({ error: 'Ticket not found' });
            }
            res.status(204).send();
        }
        catch (error) {
            console.error('Error deleting ticket:', error);
            res.status(500).json({ error: 'Failed to delete ticket' });
        }
    }
};
//# sourceMappingURL=tickets.js.map
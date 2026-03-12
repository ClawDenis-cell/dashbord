"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KanbanConfigController = void 0;
const kanbanConfig_1 = require("../models/kanbanConfig");
exports.KanbanConfigController = {
    async getConfig(req, res) {
        try {
            const { userId = 'default' } = req.query;
            let config = await kanbanConfig_1.KanbanConfigModel.findByUserId(userId);
            // If no config exists, create default one
            if (!config) {
                config = await kanbanConfig_1.KanbanConfigModel.create({ user_id: userId });
            }
            res.json(config);
        }
        catch (error) {
            console.error('Error fetching kanban config:', error);
            res.status(500).json({ error: 'Failed to fetch kanban config' });
        }
    },
    async getAll(req, res) {
        try {
            const configs = await kanbanConfig_1.KanbanConfigModel.findAll();
            res.json(configs);
        }
        catch (error) {
            console.error('Error fetching kanban configs:', error);
            res.status(500).json({ error: 'Failed to fetch kanban configs' });
        }
    },
    async create(req, res) {
        try {
            const { board_name, columns_array, user_id } = req.body;
            if (!columns_array || !Array.isArray(columns_array) || columns_array.length === 0) {
                return res.status(400).json({ error: 'columns_array must be a non-empty array' });
            }
            const config = await kanbanConfig_1.KanbanConfigModel.create({ board_name, columns_array, user_id });
            res.status(201).json(config);
        }
        catch (error) {
            console.error('Error creating kanban config:', error);
            res.status(500).json({ error: 'Failed to create kanban config' });
        }
    },
    async update(req, res) {
        try {
            const { board_name, columns_array } = req.body;
            const { userId = 'default' } = req.params;
            const config = await kanbanConfig_1.KanbanConfigModel.update(userId, { board_name, columns_array });
            if (!config) {
                return res.status(404).json({ error: 'Kanban config not found' });
            }
            res.json(config);
        }
        catch (error) {
            console.error('Error updating kanban config:', error);
            res.status(500).json({ error: 'Failed to update kanban config' });
        }
    },
    async delete(req, res) {
        try {
            const deleted = await kanbanConfig_1.KanbanConfigModel.delete(req.params.id);
            if (!deleted) {
                return res.status(404).json({ error: 'Kanban config not found' });
            }
            res.status(204).send();
        }
        catch (error) {
            console.error('Error deleting kanban config:', error);
            res.status(500).json({ error: 'Failed to delete kanban config' });
        }
    }
};
//# sourceMappingURL=kanbanConfig.js.map
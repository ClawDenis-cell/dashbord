"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KanbanBoardModel = void 0;
const database_1 = __importDefault(require("../config/database"));
exports.KanbanBoardModel = {
    async findByProjectId(projectId) {
        const result = await database_1.default.query('SELECT * FROM kanban_boards WHERE project_id = $1 ORDER BY created_at DESC', [projectId]);
        return result.rows;
    },
    async findById(id) {
        const result = await database_1.default.query('SELECT * FROM kanban_boards WHERE id = $1', [id]);
        return result.rows[0] || null;
    },
    async findByProjectAndId(projectId, id) {
        const result = await database_1.default.query('SELECT * FROM kanban_boards WHERE id = $1 AND project_id = $2', [id, projectId]);
        return result.rows[0] || null;
    },
    async create(input) {
        const { name, project_id, columns_array = ['To Do', 'In Progress', 'Done'] } = input;
        const result = await database_1.default.query(`INSERT INTO kanban_boards (name, project_id, columns_array) 
       VALUES ($1, $2, $3) 
       RETURNING *`, [name, project_id, columns_array]);
        return result.rows[0];
    },
    async update(id, input) {
        const { name, columns_array } = input;
        const result = await database_1.default.query(`UPDATE kanban_boards 
       SET name = COALESCE($1, name), 
           columns_array = COALESCE($2, columns_array)
       WHERE id = $3 
       RETURNING *`, [name, columns_array, id]);
        return result.rows[0] || null;
    },
    async delete(id) {
        const result = await database_1.default.query('DELETE FROM kanban_boards WHERE id = $1 RETURNING id', [id]);
        return result.rowCount !== null && result.rowCount > 0;
    },
    async countByProjectId(projectId) {
        const result = await database_1.default.query('SELECT COUNT(*) FROM kanban_boards WHERE project_id = $1', [projectId]);
        return parseInt(result.rows[0].count, 10);
    }
};
//# sourceMappingURL=kanbanBoards.js.map
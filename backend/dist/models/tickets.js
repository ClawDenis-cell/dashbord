"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketModel = void 0;
const database_1 = __importDefault(require("../config/database"));
exports.TicketModel = {
    async findAll() {
        const result = await database_1.default.query('SELECT * FROM tickets ORDER BY created_at DESC');
        return result.rows;
    },
    async findById(id) {
        const result = await database_1.default.query('SELECT * FROM tickets WHERE id = $1', [id]);
        return result.rows[0] || null;
    },
    async findByProjectId(projectId) {
        const result = await database_1.default.query('SELECT * FROM tickets WHERE project_id = $1 ORDER BY created_at DESC', [projectId]);
        return result.rows;
    },
    async findByBoardId(boardId) {
        const result = await database_1.default.query('SELECT * FROM tickets WHERE board_id = $1 ORDER BY created_at DESC', [boardId]);
        return result.rows;
    },
    async create(input) {
        const { title, description, project_id, board_id, status = 'open', priority = 'medium', column_name = 'To Do' } = input;
        const result = await database_1.default.query(`INSERT INTO tickets (title, description, project_id, board_id, status, priority, column_name) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`, [title, description || null, project_id || null, board_id || null, status, priority, column_name]);
        return result.rows[0];
    },
    async update(id, input) {
        const { title, description, project_id, board_id, status, priority, column_name } = input;
        const result = await database_1.default.query(`UPDATE tickets 
       SET title = COALESCE($1, title), 
           description = COALESCE($2, description), 
           project_id = COALESCE($3, project_id),
           board_id = COALESCE($4, board_id),
           status = COALESCE($5, status),
           priority = COALESCE($6, priority),
           column_name = COALESCE($7, column_name)
       WHERE id = $8 
       RETURNING *`, [title, description, project_id, board_id, status, priority, column_name, id]);
        return result.rows[0] || null;
    },
    async delete(id) {
        const result = await database_1.default.query('DELETE FROM tickets WHERE id = $1 RETURNING id', [id]);
        return result.rowCount !== null && result.rowCount > 0;
    }
};
//# sourceMappingURL=tickets.js.map
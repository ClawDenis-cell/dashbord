"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KanbanConfigModel = void 0;
const database_1 = __importDefault(require("../config/database"));
exports.KanbanConfigModel = {
    async findByUserId(userId = 'default') {
        const result = await database_1.default.query('SELECT * FROM kanban_config WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1', [userId]);
        return result.rows[0] || null;
    },
    async findAll() {
        const result = await database_1.default.query('SELECT * FROM kanban_config ORDER BY created_at DESC');
        return result.rows;
    },
    async create(input) {
        const { board_name = 'Main Board', columns_array = ['To Do', 'In Progress', 'Done'], user_id = 'default' } = input;
        const result = await database_1.default.query(`INSERT INTO kanban_config (board_name, columns_array, user_id) 
       VALUES ($1, $2, $3) 
       RETURNING *`, [board_name, columns_array, user_id]);
        return result.rows[0];
    },
    async update(userId, input) {
        const { board_name, columns_array } = input;
        const result = await database_1.default.query(`UPDATE kanban_config 
       SET board_name = COALESCE($1, board_name), 
           columns_array = COALESCE($2, columns_array)
       WHERE user_id = $3 
       RETURNING *`, [board_name, columns_array, userId]);
        return result.rows[0] || null;
    },
    async delete(id) {
        const result = await database_1.default.query('DELETE FROM kanban_config WHERE id = $1 RETURNING id', [id]);
        return result.rowCount !== null && result.rowCount > 0;
    }
};
//# sourceMappingURL=kanbanConfig.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TodoModel = void 0;
const database_1 = __importDefault(require("../config/database"));
exports.TodoModel = {
    async findAll() {
        const result = await database_1.default.query('SELECT * FROM todos ORDER BY created_at DESC');
        return result.rows;
    },
    async findById(id) {
        const result = await database_1.default.query('SELECT * FROM todos WHERE id = $1', [id]);
        return result.rows[0] || null;
    },
    async findByStatus(completed) {
        const result = await database_1.default.query('SELECT * FROM todos WHERE completed = $1 ORDER BY created_at DESC', [completed]);
        return result.rows;
    },
    async create(input) {
        const { title, completed = false } = input;
        const result = await database_1.default.query('INSERT INTO todos (title, completed) VALUES ($1, $2) RETURNING *', [title, completed]);
        return result.rows[0];
    },
    async update(id, input) {
        const { title, completed } = input;
        const result = await database_1.default.query(`UPDATE todos 
       SET title = COALESCE($1, title), 
           completed = COALESCE($2, completed)
       WHERE id = $3 
       RETURNING *`, [title, completed, id]);
        return result.rows[0] || null;
    },
    async delete(id) {
        const result = await database_1.default.query('DELETE FROM todos WHERE id = $1 RETURNING id', [id]);
        return result.rowCount !== null && result.rowCount > 0;
    }
};
//# sourceMappingURL=todos.js.map
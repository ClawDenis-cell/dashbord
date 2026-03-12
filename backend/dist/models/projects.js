"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectModel = void 0;
const database_1 = __importDefault(require("../config/database"));
exports.ProjectModel = {
    async findAll() {
        const result = await database_1.default.query('SELECT * FROM projects ORDER BY created_at DESC');
        return result.rows;
    },
    async findById(id) {
        const result = await database_1.default.query('SELECT * FROM projects WHERE id = $1', [id]);
        return result.rows[0] || null;
    },
    async create(input) {
        const { name, description, color = '#3B82F6' } = input;
        const result = await database_1.default.query('INSERT INTO projects (name, description, color) VALUES ($1, $2, $3) RETURNING *', [name, description || null, color]);
        return result.rows[0];
    },
    async update(id, input) {
        const { name, description, color } = input;
        const result = await database_1.default.query(`UPDATE projects 
       SET name = COALESCE($1, name), 
           description = COALESCE($2, description), 
           color = COALESCE($3, color)
       WHERE id = $4 
       RETURNING *`, [name, description, color, id]);
        return result.rows[0] || null;
    },
    async delete(id) {
        const result = await database_1.default.query('DELETE FROM projects WHERE id = $1 RETURNING id', [id]);
        return result.rowCount !== null && result.rowCount > 0;
    }
};
//# sourceMappingURL=projects.js.map
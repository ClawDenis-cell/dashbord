"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const database_1 = __importDefault(require("../config/database"));
exports.UserModel = {
    async findAll() {
        const result = await database_1.default.query('SELECT id, username, email, created_at, updated_at FROM users ORDER BY created_at DESC');
        return result.rows;
    },
    async findById(id) {
        const result = await database_1.default.query('SELECT * FROM users WHERE id = $1', [id]);
        return result.rows[0] || null;
    },
    async findByEmail(email) {
        const result = await database_1.default.query('SELECT * FROM users WHERE email = $1', [email]);
        return result.rows[0] || null;
    },
    async findByUsername(username) {
        const result = await database_1.default.query('SELECT * FROM users WHERE username = $1', [username]);
        return result.rows[0] || null;
    },
    async create(input) {
        const { username, email, password_hash } = input;
        const result = await database_1.default.query('INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *', [username, email, password_hash]);
        return result.rows[0];
    },
    async updateProfile(id, input) {
        const fields = [];
        const values = [];
        let paramIdx = 1;
        if (input.username) {
            fields.push(`username = $${paramIdx++}`);
            values.push(input.username);
        }
        if (input.email) {
            fields.push(`email = $${paramIdx++}`);
            values.push(input.email);
        }
        if (fields.length === 0) {
            const user = await this.findById(id);
            return user;
        }
        values.push(id);
        const result = await database_1.default.query(`UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIdx} RETURNING *`, values);
        return result.rows[0];
    },
    async updatePassword(id, password_hash) {
        await database_1.default.query('UPDATE users SET password_hash = $1 WHERE id = $2', [password_hash, id]);
    },
    async delete(id) {
        const result = await database_1.default.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
        return result.rowCount !== null && result.rowCount > 0;
    }
};
//# sourceMappingURL=user.js.map
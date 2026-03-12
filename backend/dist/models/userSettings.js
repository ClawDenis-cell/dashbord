"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSettingsModel = void 0;
const database_1 = __importDefault(require("../config/database"));
const VALID_THEMES = ['dark', 'light', 'midnight', 'sunset', 'forest', 'ocean'];
exports.UserSettingsModel = {
    async findByUserId(userId) {
        const result = await database_1.default.query('SELECT * FROM user_settings WHERE user_id = $1', [userId]);
        return result.rows[0] || null;
    },
    async getOrCreate(userId) {
        let settings = await this.findByUserId(userId);
        if (!settings) {
            const result = await database_1.default.query('INSERT INTO user_settings (user_id) VALUES ($1) RETURNING *', [userId]);
            settings = result.rows[0];
        }
        return settings;
    },
    async update(userId, input) {
        const settings = await this.getOrCreate(userId);
        const fields = [];
        const values = [];
        let paramIdx = 1;
        if (input.theme !== undefined) {
            if (!VALID_THEMES.includes(input.theme)) {
                throw new Error(`Invalid theme. Must be one of: ${VALID_THEMES.join(', ')}`);
            }
            fields.push(`theme = $${paramIdx++}`);
            values.push(input.theme);
        }
        if (input.default_board_id !== undefined) {
            fields.push(`default_board_id = $${paramIdx++}`);
            values.push(input.default_board_id);
        }
        if (input.vim_mode !== undefined) {
            fields.push(`vim_mode = $${paramIdx++}`);
            values.push(input.vim_mode);
        }
        if (input.editor_font_size !== undefined) {
            fields.push(`editor_font_size = $${paramIdx++}`);
            values.push(input.editor_font_size);
        }
        if (input.editor_tab_size !== undefined) {
            fields.push(`editor_tab_size = $${paramIdx++}`);
            values.push(input.editor_tab_size);
        }
        if (input.editor_word_wrap !== undefined) {
            fields.push(`editor_word_wrap = $${paramIdx++}`);
            values.push(input.editor_word_wrap);
        }
        if (fields.length === 0) {
            return settings;
        }
        values.push(userId);
        const result = await database_1.default.query(`UPDATE user_settings SET ${fields.join(', ')} WHERE user_id = $${paramIdx} RETURNING *`, values);
        return result.rows[0];
    },
};
//# sourceMappingURL=userSettings.js.map
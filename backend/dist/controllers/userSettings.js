"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSettingsController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userSettings_1 = require("../models/userSettings");
const user_1 = require("../models/user");
const database_1 = __importDefault(require("../config/database"));
exports.UserSettingsController = {
    async searchUsers(req, res) {
        try {
            if (!req.userId)
                return res.status(401).json({ error: 'Not authenticated.' });
            const query = (req.query.q || '').trim();
            if (query.length < 2)
                return res.json([]);
            const result = await database_1.default.query(`SELECT id, username, email FROM users
         WHERE id != $1 AND (username ILIKE $2 OR email ILIKE $2)
         ORDER BY username LIMIT 10`, [req.userId, `%${query}%`]);
            res.json(result.rows);
        }
        catch (error) {
            console.error('Error searching users:', error);
            res.status(500).json({ error: 'Failed to search users.' });
        }
    },
    async getSettings(req, res) {
        try {
            if (!req.userId)
                return res.status(401).json({ error: 'Not authenticated.' });
            const settings = await userSettings_1.UserSettingsModel.getOrCreate(req.userId);
            res.json(settings);
        }
        catch (error) {
            console.error('Error fetching settings:', error);
            res.status(500).json({ error: 'Failed to fetch settings.' });
        }
    },
    async updateSettings(req, res) {
        try {
            if (!req.userId)
                return res.status(401).json({ error: 'Not authenticated.' });
            const settings = await userSettings_1.UserSettingsModel.update(req.userId, req.body);
            res.json(settings);
        }
        catch (error) {
            console.error('Error updating settings:', error);
            if (error.message?.includes('Invalid theme')) {
                return res.status(400).json({ error: error.message });
            }
            res.status(500).json({ error: 'Failed to update settings.' });
        }
    },
    async updateProfile(req, res) {
        try {
            if (!req.userId)
                return res.status(401).json({ error: 'Not authenticated.' });
            const { username, email } = req.body;
            const user = await user_1.UserModel.findById(req.userId);
            if (!user)
                return res.status(404).json({ error: 'User not found.' });
            if (email && email !== user.email) {
                const existing = await user_1.UserModel.findByEmail(email);
                if (existing)
                    return res.status(409).json({ error: 'Email already in use.' });
            }
            if (username && username !== user.username) {
                const existing = await user_1.UserModel.findByUsername(username);
                if (existing)
                    return res.status(409).json({ error: 'Username already taken.' });
            }
            const updated = await user_1.UserModel.updateProfile(req.userId, { username, email });
            res.json({
                id: updated.id,
                username: updated.username,
                email: updated.email,
            });
        }
        catch (error) {
            console.error('Error updating profile:', error);
            res.status(500).json({ error: 'Failed to update profile.' });
        }
    },
    async updatePassword(req, res) {
        try {
            if (!req.userId)
                return res.status(401).json({ error: 'Not authenticated.' });
            const { currentPassword, newPassword } = req.body;
            if (!currentPassword || !newPassword) {
                return res.status(400).json({ error: 'Current password and new password are required.' });
            }
            if (newPassword.length < 6) {
                return res.status(400).json({ error: 'New password must be at least 6 characters.' });
            }
            const user = await user_1.UserModel.findById(req.userId);
            if (!user)
                return res.status(404).json({ error: 'User not found.' });
            const validPassword = await bcryptjs_1.default.compare(currentPassword, user.password_hash);
            if (!validPassword) {
                return res.status(401).json({ error: 'Current password is incorrect.' });
            }
            const salt = await bcryptjs_1.default.genSalt(10);
            const password_hash = await bcryptjs_1.default.hash(newPassword, salt);
            await user_1.UserModel.updatePassword(req.userId, password_hash);
            res.json({ message: 'Password updated successfully.' });
        }
        catch (error) {
            console.error('Error updating password:', error);
            res.status(500).json({ error: 'Failed to update password.' });
        }
    },
};
//# sourceMappingURL=userSettings.js.map
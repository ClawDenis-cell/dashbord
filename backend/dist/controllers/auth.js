"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_1 = require("../models/user");
const auth_1 = require("../middleware/auth");
exports.AuthController = {
    async register(req, res) {
        try {
            const { username, email, password } = req.body;
            if (!username || !email || !password) {
                return res.status(400).json({ error: 'Username, email, and password are required.' });
            }
            if (password.length < 6) {
                return res.status(400).json({ error: 'Password must be at least 6 characters.' });
            }
            const existingUser = await user_1.UserModel.findByEmail(email);
            if (existingUser) {
                return res.status(409).json({ error: 'Email already registered.' });
            }
            const existingUsername = await user_1.UserModel.findByUsername(username);
            if (existingUsername) {
                return res.status(409).json({ error: 'Username already taken.' });
            }
            const salt = await bcryptjs_1.default.genSalt(10);
            const password_hash = await bcryptjs_1.default.hash(password, salt);
            const user = await user_1.UserModel.create({ username, email, password_hash });
            const token = (0, auth_1.generateToken)({ userId: user.id, email: user.email });
            res.status(201).json({
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                },
            });
        }
        catch (error) {
            console.error('Error registering user:', error);
            res.status(500).json({ error: 'Failed to register user.' });
        }
    },
    async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password are required.' });
            }
            const user = await user_1.UserModel.findByEmail(email);
            if (!user) {
                return res.status(401).json({ error: 'Invalid email or password.' });
            }
            const validPassword = await bcryptjs_1.default.compare(password, user.password_hash);
            if (!validPassword) {
                return res.status(401).json({ error: 'Invalid email or password.' });
            }
            const token = (0, auth_1.generateToken)({ userId: user.id, email: user.email });
            res.json({
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                },
            });
        }
        catch (error) {
            console.error('Error logging in:', error);
            res.status(500).json({ error: 'Failed to login.' });
        }
    },
    async me(req, res) {
        try {
            if (!req.userId) {
                return res.status(401).json({ error: 'Not authenticated.' });
            }
            const user = await user_1.UserModel.findById(req.userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found.' });
            }
            res.json({
                id: user.id,
                username: user.username,
                email: user.email,
                created_at: user.created_at,
            });
        }
        catch (error) {
            console.error('Error fetching user:', error);
            res.status(500).json({ error: 'Failed to fetch user.' });
        }
    },
};
//# sourceMappingURL=auth.js.map
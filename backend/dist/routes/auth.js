"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../controllers/auth");
const auth_2 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/register', auth_1.AuthController.register);
router.post('/login', auth_1.AuthController.login);
router.get('/me', auth_2.authMiddleware, auth_1.AuthController.me);
exports.default = router;
//# sourceMappingURL=auth.js.map
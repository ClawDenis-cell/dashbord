"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userSettings_1 = require("../controllers/userSettings");
const router = (0, express_1.Router)();
router.get('/search', userSettings_1.UserSettingsController.searchUsers);
router.get('/settings', userSettings_1.UserSettingsController.getSettings);
router.put('/settings', userSettings_1.UserSettingsController.updateSettings);
router.put('/profile', userSettings_1.UserSettingsController.updateProfile);
router.put('/password', userSettings_1.UserSettingsController.updatePassword);
exports.default = router;
//# sourceMappingURL=userSettings.js.map
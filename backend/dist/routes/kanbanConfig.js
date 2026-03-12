"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const kanbanConfig_1 = require("../controllers/kanbanConfig");
const router = (0, express_1.Router)();
router.get('/', kanbanConfig_1.KanbanConfigController.getConfig);
router.get('/all', kanbanConfig_1.KanbanConfigController.getAll);
router.post('/', kanbanConfig_1.KanbanConfigController.create);
router.put('/:userId', kanbanConfig_1.KanbanConfigController.update);
router.delete('/:id', kanbanConfig_1.KanbanConfigController.delete);
exports.default = router;
//# sourceMappingURL=kanbanConfig.js.map
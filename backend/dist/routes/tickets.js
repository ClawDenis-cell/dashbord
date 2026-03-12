"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tickets_1 = require("../controllers/tickets");
const router = (0, express_1.Router)();
router.get('/', tickets_1.TicketController.getAll);
router.get('/board/:boardId', tickets_1.TicketController.getByBoard);
router.get('/:id', tickets_1.TicketController.getById);
router.post('/', tickets_1.TicketController.create);
router.put('/:id', tickets_1.TicketController.update);
router.delete('/:id', tickets_1.TicketController.delete);
exports.default = router;
//# sourceMappingURL=tickets.js.map
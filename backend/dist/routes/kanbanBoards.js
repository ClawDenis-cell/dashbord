"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const kanbanBoards_1 = require("../controllers/kanbanBoards");
const router = (0, express_1.Router)();
// GET /api/kanban-boards?projectId={id} - Get all boards for a project
router.get('/', kanbanBoards_1.KanbanBoardController.getByProject);
// GET /api/kanban-boards/:id - Get single board
router.get('/:id', kanbanBoards_1.KanbanBoardController.getById);
// POST /api/kanban-boards - Create new board
router.post('/', kanbanBoards_1.KanbanBoardController.create);
// PUT /api/kanban-boards/:id - Update board
router.put('/:id', kanbanBoards_1.KanbanBoardController.update);
// DELETE /api/kanban-boards/:id - Delete board
router.delete('/:id', kanbanBoards_1.KanbanBoardController.delete);
exports.default = router;
//# sourceMappingURL=kanbanBoards.js.map
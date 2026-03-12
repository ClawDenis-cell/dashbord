"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const todos_1 = require("../controllers/todos");
const router = (0, express_1.Router)();
router.get('/', todos_1.TodoController.getAll);
router.get('/:id', todos_1.TodoController.getById);
router.post('/', todos_1.TodoController.create);
router.put('/:id', todos_1.TodoController.update);
router.delete('/:id', todos_1.TodoController.delete);
exports.default = router;
//# sourceMappingURL=todos.js.map
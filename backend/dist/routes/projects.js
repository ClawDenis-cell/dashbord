"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const projects_1 = require("../controllers/projects");
const router = (0, express_1.Router)();
router.get('/', projects_1.ProjectController.getAll);
router.get('/:id', projects_1.ProjectController.getById);
router.post('/', projects_1.ProjectController.create);
router.put('/:id', projects_1.ProjectController.update);
router.delete('/:id', projects_1.ProjectController.delete);
exports.default = router;
//# sourceMappingURL=projects.js.map
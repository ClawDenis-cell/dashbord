"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const documents_1 = require("../controllers/documents");
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type. Only images are allowed.'));
        }
    },
});
const router = (0, express_1.Router)();
// Folder routes (must be before /:id routes)
router.get('/folders', documents_1.DocumentController.getFolders);
router.post('/folders', documents_1.DocumentController.createFolder);
router.put('/folders/:id', documents_1.DocumentController.updateFolder);
router.delete('/folders/:id', documents_1.DocumentController.deleteFolder);
// Document CRUD
router.get('/', documents_1.DocumentController.getAll);
router.get('/recent', documents_1.DocumentController.getRecent);
router.get('/project/:projectId', documents_1.DocumentController.getByProject);
router.get('/:id', documents_1.DocumentController.getById);
router.post('/', documents_1.DocumentController.create);
router.put('/:id', documents_1.DocumentController.update);
router.delete('/:id', documents_1.DocumentController.delete);
// Collaborators
router.get('/:id/collaborators', documents_1.DocumentController.getCollaborators);
router.post('/:id/collaborators', documents_1.DocumentController.addCollaborator);
router.delete('/:id/collaborators/:userId', documents_1.DocumentController.removeCollaborator);
// Invites
router.post('/:id/invites', documents_1.DocumentController.createInvite);
router.post('/invites/:token/accept', documents_1.DocumentController.acceptInvite);
// Image upload
router.post('/:id/images', upload.single('image'), documents_1.DocumentController.uploadImage);
router.post('/:id/images/url', documents_1.DocumentController.uploadImageUrl);
// Export
router.get('/:id/export/html', documents_1.DocumentController.exportHtml);
router.get('/:id/export/pdf', documents_1.DocumentController.exportPdf);
exports.default = router;
//# sourceMappingURL=documents.js.map
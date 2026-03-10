import { Router } from 'express';
import { DocumentController } from '../controllers/documents';
import multer from 'multer';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'));
    }
  },
});

const router = Router();

router.get('/', DocumentController.getAll);
router.get('/recent', DocumentController.getRecent);
router.get('/project/:projectId', DocumentController.getByProject);
router.get('/:id', DocumentController.getById);
router.post('/', DocumentController.create);
router.put('/:id', DocumentController.update);
router.delete('/:id', DocumentController.delete);

// Collaborators
router.get('/:id/collaborators', DocumentController.getCollaborators);
router.post('/:id/collaborators', DocumentController.addCollaborator);
router.delete('/:id/collaborators/:userId', DocumentController.removeCollaborator);

// Invites
router.post('/:id/invites', DocumentController.createInvite);
router.post('/invites/:token/accept', DocumentController.acceptInvite);

// Image upload
router.post('/:id/images', upload.single('image'), DocumentController.uploadImage);

// Export
router.get('/:id/export/pdf', DocumentController.exportPdf);

export default router;

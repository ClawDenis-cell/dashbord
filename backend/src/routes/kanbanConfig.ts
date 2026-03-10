import { Router } from 'express';
import { KanbanConfigController } from '../controllers/kanbanConfig';

const router = Router();

router.get('/', KanbanConfigController.getConfig);
router.get('/all', KanbanConfigController.getAll);
router.post('/', KanbanConfigController.create);
router.put('/:userId', KanbanConfigController.update);
router.delete('/:id', KanbanConfigController.delete);

export default router;

import { Router } from 'express';
import { TodoController } from '../controllers/todos';

const router = Router();

router.get('/', TodoController.getAll);
router.get('/:id', TodoController.getById);
router.post('/', TodoController.create);
router.put('/:id', TodoController.update);
router.delete('/:id', TodoController.delete);

export default router;

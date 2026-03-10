import { Router } from 'express';
import { TicketController } from '../controllers/tickets';

const router = Router();

router.get('/', TicketController.getAll);
router.get('/:id', TicketController.getById);
router.post('/', TicketController.create);
router.put('/:id', TicketController.update);
router.delete('/:id', TicketController.delete);

export default router;

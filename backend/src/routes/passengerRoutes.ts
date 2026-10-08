import { Router } from 'express';
import { passengerController } from '../controllers/passengerController.js';

const router = Router();

// Full CRUD Endpoints for Passengers
router.get('/', passengerController.getAll);
router.get('/:id', passengerController.getById);
router.post('/', passengerController.create);
router.put('/:id', passengerController.update);
router.patch('/:id', passengerController.update);
router.delete('/:id', passengerController.delete);
router.post('/:id/top-up', passengerController.topUp);

export default router;

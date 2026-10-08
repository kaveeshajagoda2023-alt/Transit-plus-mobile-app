import { Router } from 'express';
import { driverController } from '../controllers/driverController.js';

const router = Router();

// Full CRUD Endpoints for Drivers / Operators
router.get('/', driverController.getAll);
router.get('/:id', driverController.getById);
router.post('/', driverController.create);
router.put('/:id', driverController.update);
router.patch('/:id', driverController.update);
router.delete('/:id', driverController.delete);
router.post('/:id/assign-vehicle', driverController.assignVehicle);
router.post('/:id/duty-status', driverController.switchDutyStatus);

export default router;

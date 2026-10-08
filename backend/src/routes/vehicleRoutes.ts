import { Router } from 'express';
import { vehicleController } from '../controllers/vehicleController.js';

const router = Router();

router.get('/', vehicleController.getVehicles);
router.get('/:id', vehicleController.getVehicleById);
router.get('/:id/location', vehicleController.getVehicleLocation);
router.post('/:id/location', vehicleController.updateLocation);
router.put('/:id/location', vehicleController.updateLocation);
router.post('/:id/telemetry', vehicleController.updateTelemetry);

export default router;

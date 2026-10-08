import { Router } from 'express';
import { tripController } from '../controllers/tripController.js';

const router = Router();

router.get('/active', tripController.getActiveTrip);
router.get('/:id', tripController.getTripById);
router.post('/:id/toggle-doors', tripController.toggleDoors);
router.post('/:id/advance-stop', tripController.advanceStop);
router.post('/:id/occupancy', tripController.updateOccupancy);
router.post('/:id/cash-fare', tripController.recordCashFare);
router.post('/:id/report-delay', tripController.reportDelay);
router.post('/:id/dispatch', tripController.sendDispatchMessage);
router.post('/:id/end', tripController.endTrip);
router.post('/:id/issues', tripController.reportTripIssue);
router.post('/:id/scan-ticket', tripController.scanTicket);
router.get('/:id/passengers', tripController.getManifest);
router.post('/:id/passengers/:passengerId/board', tripController.boardPassenger);
router.get('/:id/report', tripController.exportManifest);

export default router;

import { Router } from 'express';
import { operatorController } from '../controllers/operatorController.js';

const router = Router();

router.get('/profile', operatorController.getProfile);
router.post('/duty-status', operatorController.updateDutyStatus);
router.post('/switch-vehicle', operatorController.switchVehicle);
router.post('/toggle-beep', operatorController.toggleBeep);
router.post('/toggle-brightness', operatorController.toggleBrightness);
router.post('/reconnect-scanner', operatorController.reconnectScanner);
router.post('/sync-airgap', operatorController.syncAirGap);
router.post('/report-fault', operatorController.reportFault);
router.get('/faults', operatorController.getFaults);
router.post('/shift-summary', operatorController.completeShiftSummary);

export default router;

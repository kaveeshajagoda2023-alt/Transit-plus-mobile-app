import { Router } from 'express';
import { terminalController } from '../controllers/terminalController.js';

const router = Router();

router.get('/status', terminalController.getStatus);
router.get('/ping', terminalController.ping);
router.post('/offline', terminalController.setSimulatedOffline);

export default router;

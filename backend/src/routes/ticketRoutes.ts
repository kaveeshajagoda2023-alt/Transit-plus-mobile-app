import { Router } from 'express';
import { ticketController } from '../controllers/ticketController.js';

const router = Router();

router.post('/validate', ticketController.validateTicket);
router.get('/lookup-preview', ticketController.lookupPreview);
router.post('/issue', ticketController.issueTicket);
router.post('/batch-sync', ticketController.batchSync);

export default router;

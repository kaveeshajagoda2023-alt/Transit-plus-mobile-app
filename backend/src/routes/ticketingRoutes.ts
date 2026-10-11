import { Router } from 'express';
import { ticketingController } from '../controllers/ticketingController.js';

/** Member 2 — Passenger Ticketing endpoints, mounted at /api/ticketing */
const router = Router();

router.get('/routes', ticketingController.getRoutes);
router.post('/quote', ticketingController.quote);

// Ticket CRUD
router.post('/tickets', ticketingController.createTicket);
router.get('/tickets', ticketingController.listTickets);
router.get('/tickets/:id', ticketingController.getTicket);
router.patch('/tickets/:id', ticketingController.updateTicket);
router.delete('/tickets/:id', ticketingController.deleteTicket);

// Payment and cancellation
router.post('/tickets/:id/pay', ticketingController.payForTicket);
router.get('/tickets/:id/cancellation-preview', ticketingController.cancellationPreview);
router.post('/tickets/:id/cancel', ticketingController.cancelTicket);

router.get('/payments', ticketingController.listPayments);
router.get('/payments/:id', ticketingController.getPayment);
router.get('/wallet/:passengerId', ticketingController.getWallet);

export default router;

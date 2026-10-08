const express = require('express');
const { body } = require('express-validator');
const {
  createTicket,
  getUserTickets,
  getTicketById,
  updateTicketStatus,
  validateQrTicket,
  deleteTicket,
} = require('../controllers/ticketController');

const router = express.Router();

// POST /api/tickets - Create ticket
router.post(
  '/',
  [
    body('userId').notEmpty().withMessage('userId is required'),
    body('route').notEmpty().withMessage('route is required'),
    body('boardingPoint').notEmpty().withMessage('boardingPoint is required'),
    body('destination').notEmpty().withMessage('destination is required'),
    body('travelDate').notEmpty().withMessage('travelDate is required'),
    body('travelTime').notEmpty().withMessage('travelTime is required'),
    body('fare').isNumeric().withMessage('fare must be a valid number'),
  ],
  createTicket
);

// GET /api/tickets/user/:userId - Read passenger history
router.get('/user/:userId', getUserTickets);

// POST /api/tickets/validate-qr - Validate a ticket using the backend source of truth
router.post('/validate-qr', validateQrTicket);

// GET /api/tickets/:id - Read single ticket details
router.get('/:id', getTicketById);

// PUT /api/tickets/:id/status - Update permitted ticket status
router.put(
  '/:id/status',
  [
    body('ticketStatus')
      .isIn(['Active', 'Used', 'Expired', 'Cancelled'])
      .withMessage('ticketStatus must be one of Active, Used, Expired, Cancelled'),
  ],
  updateTicketStatus
);

// DELETE /api/tickets/:id - Cancel/delete ticket
router.delete('/:id', deleteTicket);

module.exports = router;

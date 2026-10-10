const express = require('express');
const { body, param, query } = require('express-validator');
const {
  createTicket,
  listTickets,
  getTicket,
  updateTicket,
  cancelTicket,
  hideTicket,
  rebookTicket,
  getQr,
  rotateQr,
} = require('../controllers/ticketController');
const { scanTicket } = require('../controllers/validationController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { TICKET_STATUSES } = require('../models/Ticket');

const router = express.Router();

router.use(protect);

const idParam = param('id').trim().notEmpty().withMessage('Ticket id is required');
const travelDateRule = (chain) => chain.isISO8601().withMessage('Travel date must be a valid date');
const passengersRule = (chain) => chain.isInt({ min: 1, max: 10 }).withMessage('Passengers must be between 1 and 10');

// POST /api/tickets - create a ticket awaiting payment
router.post(
  '/',
  [
    body('routeId').isMongoId().withMessage('Choose a route'),
    body('fromStop').trim().notEmpty().withMessage('Choose a boarding stop'),
    body('toStop').trim().notEmpty().withMessage('Choose a destination stop'),
    body('passengerType').optional().isIn(['adult', 'student', 'senior', 'child']).withMessage('Invalid passenger type'),
    passengersRule(body('passengers').optional()),
    travelDateRule(body('travelDate')),
  ],
  validate,
  createTicket
);

// GET /api/tickets - purchase history with filters + pagination
router.get(
  '/',
  [
    query('status')
      .optional()
      .custom((v) => v.split(',').every((s) => TICKET_STATUSES.includes(s)))
      .withMessage('Invalid status filter'),
    query('from').optional().isISO8601().withMessage('from must be a date'),
    query('to').optional().isISO8601().withMessage('to must be a date'),
    query('search').optional().isString().isLength({ max: 60 }),
    query('page').optional().isInt({ min: 1 }).withMessage('page must be 1 or more'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('limit must be 1-50'),
  ],
  validate,
  listTickets
);

// Kept from the first version of the scanner: delegates to /api/validation/scan
router.post('/validate-qr', [body('token').notEmpty().withMessage('QR token is required')], validate, scanTicket);

router.get('/:id', [idParam], validate, getTicket);

router.put(
  '/:id',
  [
    idParam,
    travelDateRule(body('travelDate').optional()),
    passengersRule(body('passengers').optional()),
    body().custom((b) => b.travelDate !== undefined || b.passengers !== undefined)
      .withMessage('Nothing to update'),
  ],
  validate,
  updateTicket
);

router.post('/:id/cancel', [idParam], validate, cancelTicket);
router.delete('/:id', [idParam], validate, hideTicket);
router.post('/:id/rebook', [idParam, travelDateRule(body('travelDate').optional())], validate, rebookTicket);

router.get('/:id/qr', [idParam], validate, getQr);
router.post('/:id/qr/rotate', [idParam], validate, rotateQr);

module.exports = router;

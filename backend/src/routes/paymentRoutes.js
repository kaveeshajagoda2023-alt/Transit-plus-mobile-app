const express = require('express');
const { body } = require('express-validator');
const { createPayment } = require('../controllers/paymentController');

const router = express.Router();

// POST /api/payments - Process simulated payment
router.post(
  '/',
  [
    body('userId').notEmpty().withMessage('userId is required'),
    body('amount').isNumeric().withMessage('amount must be a valid number'),
    body('paymentMethod').notEmpty().withMessage('paymentMethod is required'),
  ],
  createPayment
);

module.exports = router;

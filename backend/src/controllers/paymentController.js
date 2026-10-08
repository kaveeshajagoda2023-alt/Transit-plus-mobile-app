const Payment = require('../models/Payment');
const mongoose = require('mongoose');
const { validationResult } = require('express-validator');

// In-memory fallback array when MongoDB local service is offline
const inMemoryPayments = [];

// @desc    Process simulated payment
// @route   POST /api/payments
// @access  Public
const createPayment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { userId, ticketId, amount, paymentMethod } = req.body;

    const paymentId = `PAY-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const transactionRef = `TXN-${Date.now()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const paymentPayload = {
      paymentId,
      ticketId: ticketId || `TEMP-${Date.now()}`,
      userId,
      amount: Number(amount),
      paymentMethod: paymentMethod || 'Simulated Pay',
      paymentStatus: 'Completed',
      transactionRef,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (mongoose.connection.readyState === 1) {
      const payment = new Payment(paymentPayload);
      const savedPayment = await payment.save();
      return res.status(201).json({
        success: true,
        message: 'Payment simulated successfully',
        payment: savedPayment,
      });
    } else {
      inMemoryPayments.push(paymentPayload);
      return res.status(201).json({
        success: true,
        message: 'Payment simulated successfully (In-Memory)',
        payment: paymentPayload,
      });
    }
  } catch (error) {
    console.error('Error creating payment:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error processing simulated payment',
      error: error.message,
    });
  }
};

module.exports = {
  createPayment,
};

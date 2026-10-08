const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    paymentId: {
      type: String,
      required: [true, 'Payment ID is required'],
      unique: true,
      trim: true,
      index: true,
    },
    ticketId: {
      type: String,
      required: [true, 'Associated Ticket ID is required'],
      trim: true,
      index: true,
    },
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      trim: true,
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    paymentMethod: {
      type: String,
      required: [true, 'Payment method is required'],
      trim: true,
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
      default: 'Completed',
    },
    transactionRef: {
      type: String,
      required: [true, 'Transaction reference is required'],
      unique: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Note: No real credit card numbers, CVVs, or sensitive credentials are saved in accordance with security guidelines.

module.exports = mongoose.model('Payment', paymentSchema);

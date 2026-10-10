const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    method: { type: String, enum: ['CARD', 'WALLET', 'CASH_ON_BOARD'], required: true },
    status: { type: String, enum: ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'], default: 'PENDING' },
    // Card summary only (brand + last4). Full card numbers and CVVs are never stored.
    cardBrand: { type: String },
    cardLast4: { type: String },
    transactionRef: { type: String, required: true, unique: true },
    receiptNumber: { type: String, unique: true, sparse: true },
    failureReason: { type: String },
    refundAmount: { type: Number, default: 0 },
    refundedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);

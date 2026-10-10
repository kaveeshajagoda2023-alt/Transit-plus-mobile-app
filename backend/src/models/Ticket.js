const mongoose = require('mongoose');

const TICKET_STATUSES = ['PENDING_PAYMENT', 'ACTIVE', 'USED', 'EXPIRED', 'CANCELLED', 'REFUNDED'];
// Statuses that can never change again - only these can be hidden from history
const TERMINAL_STATUSES = ['USED', 'EXPIRED', 'CANCELLED', 'REFUNDED'];

const ticketSchema = new mongoose.Schema(
  {
    ticketNumber: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    route: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
    fromStop: { type: String, required: true, trim: true },
    toStop: { type: String, required: true, trim: true },
    passengerType: { type: String, enum: ['adult', 'student', 'senior', 'child'], default: 'adult' },
    passengers: { type: Number, required: true, min: 1, max: 10 },
    unitFare: { type: Number, required: true, min: 0 },
    totalFare: { type: Number, required: true, min: 0 },
    // Planned departure date-time chosen by the passenger
    travelDate: { type: Date, required: true },
    validFrom: { type: Date, required: true },
    validUntil: { type: Date, required: true },
    status: { type: String, enum: TICKET_STATUSES, default: 'PENDING_PAYMENT', index: true },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    // Bumped on rotate / reschedule so older QR tokens stop working
    qrVersion: { type: Number, default: 1 },
    usedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    refundAmount: { type: Number, default: 0 },
    hiddenFromHistory: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ticketSchema.index({ user: 1, status: 1, travelDate: -1 });

module.exports = mongoose.model('Ticket', ticketSchema);
module.exports.TICKET_STATUSES = TICKET_STATUSES;
module.exports.TERMINAL_STATUSES = TERMINAL_STATUSES;

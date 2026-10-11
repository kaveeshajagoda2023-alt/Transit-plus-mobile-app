import mongoose, { Schema } from 'mongoose';

/**
 * Member 2 — Passenger Ticketing
 * Payment / receipt for a ticket. Only the card brand and last 4 digits are
 * stored — full card numbers and CVVs are never saved.
 */
const TicketPaymentSchema = new Schema(
  {
    ticketId: { type: String, required: true, index: true },
    ticketNumber: { type: String, required: true },
    passengerId: { type: String, required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    method: { type: String, enum: ['WALLET', 'CARD'], required: true },
    status: { type: String, enum: ['SUCCESS', 'FAILED', 'REFUNDED'], required: true },
    cardBrand: { type: String },
    cardLast4: { type: String },
    transactionRef: { type: String, required: true, unique: true },
    receiptNumber: { type: String },
    failureReason: { type: String },
    refundAmount: { type: Number, default: 0 },
    refundedAt: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret: Record<string, unknown>) => {
        if (ret._id) ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;
        if (ret.createdAt instanceof Date) ret.createdAt = ret.createdAt.toISOString();
        if (ret.updatedAt instanceof Date) ret.updatedAt = ret.updatedAt.toISOString();
        return ret;
      },
    },
  }
);

export const TicketPaymentModel =
  mongoose.models.TicketPayment || mongoose.model('TicketPayment', TicketPaymentSchema);

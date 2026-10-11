import mongoose, { Schema } from 'mongoose';

/**
 * Member 2 — Passenger Ticketing
 * A digital ticket bought by a passenger in the app. The QR code on the
 * ticket encodes `ticketNumber`, which the conductor scanner validates.
 */
const PassengerTicketSchema = new Schema(
  {
    ticketNumber: { type: String, required: true, unique: true, index: true },
    passengerId: { type: String, required: true, index: true },
    passengerName: { type: String, required: true, trim: true },
    routeId: { type: String, required: true },
    routeNumber: { type: String, required: true },
    routeName: { type: String, required: true },
    transportType: { type: String, enum: ['bus', 'train'], default: 'bus' },
    fromStopId: { type: String, required: true },
    fromStop: { type: String, required: true },
    fromSequence: { type: Number, required: true },
    toStopId: { type: String, required: true },
    toStop: { type: String, required: true },
    toSequence: { type: Number, required: true },
    fareCategory: { type: String, enum: ['ADULT', 'STUDENT', 'SENIOR', 'CHILD'], default: 'ADULT' },
    passengers: { type: Number, required: true, min: 1, max: 10 },
    unitFare: { type: Number, required: true, min: 0 },
    totalFare: { type: Number, required: true, min: 0 },
    travelDate: { type: String, required: true },
    validFrom: { type: String, required: true },
    validUntil: { type: String, required: true },
    status: {
      type: String,
      enum: ['PENDING_PAYMENT', 'ACTIVE', 'USED', 'EXPIRED', 'CANCELLED'],
      default: 'PENDING_PAYMENT',
      index: true,
    },
    paymentId: { type: String },
    rescheduleCount: { type: Number, default: 0 },
    usedAt: { type: String },
    cancelledAt: { type: String },
    refundAmount: { type: Number, default: 0 },
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

PassengerTicketSchema.index({ passengerId: 1, status: 1, travelDate: -1 });

export const PassengerTicketModel =
  mongoose.models.PassengerTicket || mongoose.model('PassengerTicket', PassengerTicketSchema);

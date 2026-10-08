const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: [true, 'Ticket ID is required'],
      unique: true,
      trim: true,
      index: true,
    },
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      trim: true,
      index: true,
    },
    passengerName: {
      type: String,
      trim: true,
      default: 'Transit Passenger',
    },
    route: {
      type: String,
      required: [true, 'Route is required'],
      trim: true,
    },
    boardingPoint: {
      type: String,
      required: [true, 'Boarding point is required'],
      trim: true,
    },
    destination: {
      type: String,
      required: [true, 'Destination is required'],
      trim: true,
    },
    travelDate: {
      type: String,
      required: [true, 'Travel date is required'],
    },
    travelTime: {
      type: String,
      required: [true, 'Travel time is required'],
    },
    fare: {
      type: Number,
      required: [true, 'Fare amount is required'],
      min: [0, 'Fare cannot be negative'],
    },
    paymentMethod: {
      type: String,
      required: [true, 'Payment method is required'],
      enum: {
        values: ['Credit Card', 'Debit Card', 'Digital Wallet', 'Simulated Pay'],
        message: '{VALUE} is not a supported payment method',
      },
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
      default: 'Completed',
    },
    ticketStatus: {
      type: String,
      enum: ['Active', 'Used', 'Expired', 'Cancelled'],
      default: 'Active',
      index: true,
    },
    qrData: {
      type: String,
      required: [true, 'QR code payload data is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying user's tickets by status efficiently
ticketSchema.index({ userId: 1, ticketStatus: 1, createdAt: -1 });

module.exports = mongoose.model('Ticket', ticketSchema);

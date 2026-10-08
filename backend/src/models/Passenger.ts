import mongoose, { Schema, Document } from 'mongoose';
import { PassengerUser, ConcessionType } from '../types/index.js';

export interface IPassengerDocument extends Document, Omit<PassengerUser, 'id'> {
  _id: mongoose.Types.ObjectId;
}

const PassengerSchema = new Schema<IPassengerDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    role: { type: String, default: 'PASSENGER' },
    concessionType: {
      type: String,
      enum: ['STANDARD_ADULT', 'STUDENT_YOUTH', 'SENIOR_CONCESSION'],
      default: 'STANDARD_ADULT',
    },
    metroPayBalance: { type: Number, default: 0.0, min: 0 },
    digitalTicketsCount: { type: Number, default: 0, min: 0 },
    emailVerified: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['ACTIVE', 'PENDING_VERIFICATION', 'SUSPENDED'],
      default: 'ACTIVE',
    },
    savedRoutesCount: { type: Number, default: 0 },
    avatarUrl: { type: String },
    passwordHash: { type: String },
    otpCode: { type: String },
    resetToken: { type: String },
    lastLoginAt: { type: String, default: () => new Date().toISOString() },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret: any) => {
        if (ret._id) {
          ret.id = ret._id.toString();
        }
        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash;
        delete ret.otpCode;
        return ret;
      },
    },
  }
);

PassengerSchema.index({ email: 1 });
PassengerSchema.index({ name: 'text', email: 'text' });

export const PassengerModel = mongoose.models.Passenger || mongoose.model<IPassengerDocument>('Passenger', PassengerSchema);

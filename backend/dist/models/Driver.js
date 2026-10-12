import mongoose, { Schema } from 'mongoose';
const DriverSchema = new Schema({
    staffId: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    licenseNumber: { type: String, trim: true },
    role: {
        type: String,
        enum: ['DRIVER', 'CONDUCTOR', 'DISPATCHER', 'ADMIN', 'PASSENGER'],
        default: 'DRIVER',
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'SUSPENDED', 'OFF_DUTY'],
        default: 'ACTIVE',
    },
    terminalAccess: { type: Boolean, default: true },
    vehicleAccess: { type: [String], default: ['Bus #4028'] },
    assignedVehicle: { type: String, default: 'Bus #4028' },
    nfcBadgeId: { type: String, trim: true },
    dispatchZone: { type: String, default: 'DISPATCH ZONE 4' },
    badgeLabel: { type: String, default: 'Certified Operator' },
    shiftHours: { type: String, default: '06:00 - 14:00' },
    lastLogin: { type: String },
    passwordHash: { type: String },
    pinHash: { type: String },
    failedAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Number },
    rating: { type: Number, default: 4.85, min: 0, max: 5 },
    totalTripsCompleted: { type: Number, default: 0, min: 0 },
    emergencyContact: { type: String },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: (_, ret) => {
            if (ret._id) {
                ret.id = ret._id.toString();
            }
            delete ret._id;
            delete ret.__v;
            delete ret.passwordHash;
            delete ret.pinHash;
            return ret;
        },
    },
});
DriverSchema.index({ name: 'text', staffId: 'text' });
export const DriverModel = mongoose.models.Driver || mongoose.model('Driver', DriverSchema);

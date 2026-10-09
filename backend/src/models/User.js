const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const PASSENGER_TYPES = ['adult', 'student', 'senior', 'child'];
const LANGUAGES = ['en', 'si', 'ta'];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true, default: '' },
    passwordHash: { type: String, required: true, select: false },
    passengerType: { type: String, enum: PASSENGER_TYPES, default: 'adult' },
    preferredLanguage: { type: String, enum: LANGUAGES, default: 'en' },
    // Reserved for Member 3 (driver/conductor) and Member 4 (admin) when merging
    role: { type: String, enum: ['passenger', 'conductor', 'admin'], default: 'passenger' },
  },
  { timestamps: true }
);

userSchema.methods.checkPassword = function checkPassword(plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

userSchema.statics.hashPassword = (plain) => bcrypt.hash(plain, 10);

userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.passwordHash;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
module.exports.PASSENGER_TYPES = PASSENGER_TYPES;
module.exports.LANGUAGES = LANGUAGES;

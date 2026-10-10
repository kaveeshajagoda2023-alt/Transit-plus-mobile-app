const mongoose = require('mongoose');

// Only a display summary of a card is kept. Never add cardNumber or cvv fields here.
const savedPaymentMethodSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    brand: { type: String, required: true },
    last4: { type: String, required: true, match: /^\d{4}$/ },
    expiry: { type: String, required: true, match: /^\d{2}\/\d{2}$/ },
    holderName: { type: String, trim: true, default: '' },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SavedPaymentMethod', savedPaymentMethodSchema);

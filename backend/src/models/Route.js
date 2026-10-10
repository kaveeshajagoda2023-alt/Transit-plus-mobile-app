const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    // Ordered list of stop names, first to last
    stops: {
      type: [String],
      validate: [(v) => v.length >= 2, 'A route needs at least two stops'],
    },
    baseFare: { type: Number, required: true, min: 0 },
    // fareTable[n] = adult fare (LKR) for travelling n stops. Index 0 is unused (0).
    fareTable: { type: [Number], default: [] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Route', routeSchema);

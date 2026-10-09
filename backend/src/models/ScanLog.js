const mongoose = require('mongoose');

const SCAN_RESULTS = ['VALID', 'ALREADY_USED', 'EXPIRED', 'INVALID'];

const scanLogSchema = new mongoose.Schema({
  // Empty when the QR could not be linked to a ticket (tampered / malformed)
  ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', default: null },
  scannedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  result: { type: String, enum: SCAN_RESULTS, required: true },
  reason: { type: String, required: true },
  scannedAt: { type: Date, default: Date.now, index: true },
});

module.exports = mongoose.model('ScanLog', scanLogSchema);
module.exports.SCAN_RESULTS = SCAN_RESULTS;

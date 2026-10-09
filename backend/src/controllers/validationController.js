const Ticket = require('../models/Ticket');
const Payment = require('../models/Payment');
const ScanLog = require('../models/ScanLog');
const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/respond');
const { verifyQrToken } = require('../utils/qrToken');

// Human-readable text for every reason code the scanner can show
const REASON_MESSAGES = {
  OK: 'Ticket is valid. Have a good journey!',
  MALFORMED: 'This is not a TransitPulse ticket QR code.',
  BAD_SIGNATURE: 'QR code has been altered or forged.',
  QR_EXPIRED: 'QR code has expired. Ask the passenger to open the live QR in the app.',
  TICKET_NOT_FOUND: 'Ticket does not exist.',
  QR_REPLACED: 'A newer QR code was issued for this ticket. This one is no longer valid.',
  TICKET_CANCELLED: 'Ticket was cancelled.',
  NOT_PAID: 'Ticket has not been paid for.',
  ALREADY_USED: 'Ticket has already been used.',
  TICKET_EXPIRED: 'Ticket validity period has ended.',
  NOT_YET_VALID: 'Ticket is not valid yet. Check the travel time.',
};

const ticketSummary = (t) =>
  t && {
    _id: t._id,
    ticketNumber: t.ticketNumber,
    route: t.route && { code: t.route.code, name: t.route.name },
    fromStop: t.fromStop,
    toStop: t.toStop,
    passengerType: t.passengerType,
    passengers: t.passengers,
    validFrom: t.validFrom,
    validUntil: t.validUntil,
    status: t.status,
    usedAt: t.usedAt,
  };

// Decide the scan outcome. Returns { result, reason, ticket }.
const evaluate = async (token, now) => {
  const check = verifyQrToken(token, now.getTime());

  if (!check.valid && check.reason !== 'QR_EXPIRED') {
    return { result: 'INVALID', reason: check.reason, ticket: null };
  }

  // Signature is genuine from here on, so the ticket id in the payload can be trusted
  const ticket = await Ticket.findById(check.payload.ticketId).populate('route', 'code name');
  if (!ticket) return { result: 'INVALID', reason: 'TICKET_NOT_FOUND', ticket: null };
  if (check.reason === 'QR_EXPIRED') return { result: 'EXPIRED', reason: 'QR_EXPIRED', ticket };

  if (['CANCELLED', 'REFUNDED'].includes(ticket.status)) return { result: 'INVALID', reason: 'TICKET_CANCELLED', ticket };
  if (ticket.status === 'PENDING_PAYMENT') return { result: 'INVALID', reason: 'NOT_PAID', ticket };
  if (ticket.status === 'USED' || ticket.usedAt) return { result: 'ALREADY_USED', reason: 'ALREADY_USED', ticket };
  if (ticket.status === 'EXPIRED' || ticket.validUntil < now) {
    if (ticket.status !== 'EXPIRED') {
      ticket.status = 'EXPIRED';
      await ticket.save();
    }
    return { result: 'EXPIRED', reason: 'TICKET_EXPIRED', ticket };
  }
  if (check.payload.qrVersion !== ticket.qrVersion) return { result: 'INVALID', reason: 'QR_REPLACED', ticket };
  if (ticket.validFrom > now) return { result: 'INVALID', reason: 'NOT_YET_VALID', ticket };

  // Atomic check-and-set: if two scanners read the same QR at once, only one wins
  const used = await Ticket.findOneAndUpdate(
    { _id: ticket._id, status: 'ACTIVE', usedAt: null, qrVersion: ticket.qrVersion },
    { status: 'USED', usedAt: now },
    { new: true }
  ).populate('route', 'code name');
  if (!used) return { result: 'ALREADY_USED', reason: 'ALREADY_USED', ticket };

  // Cash-on-board fare is collected by the conductor at this point
  await Payment.updateOne({ _id: used.payment, status: 'PENDING', method: 'CASH_ON_BOARD' }, { status: 'SUCCESS' });

  return { result: 'VALID', reason: 'OK', ticket: used };
};

// @route POST /api/validation/scan  body: { token }
// Always 200 when the scan was processed: the verdict is in data.result.
const scanTicket = asyncHandler(async (req, res) => {
  const now = new Date();
  const { result, reason, ticket } = await evaluate(req.body.token, now);

  const log = await ScanLog.create({
    ticket: ticket?._id || null,
    scannedBy: req.user._id,
    result,
    reason,
    scannedAt: now,
  });

  return res.status(200).json({
    success: result === 'VALID',
    message: REASON_MESSAGES[reason] || reason,
    data: { result, reason, ticket: ticketSummary(ticket), scanLogId: log._id, scannedAt: now },
  });
});

// @route GET /api/validation/logs?page=&limit=&result=
const listLogs = asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 20);
  // Passengers/conductors see their own scans; admins (Member 4) see all
  const filter = req.user.role === 'admin' ? {} : { scannedBy: req.user._id };
  if (req.query.result) filter.result = req.query.result;

  const [items, total] = await Promise.all([
    ScanLog.find(filter)
      .sort({ scannedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate({ path: 'ticket', select: 'ticketNumber fromStop toStop route', populate: { path: 'route', select: 'code name' } })
      .lean(),
    ScanLog.countDocuments(filter),
  ]);

  return ok(res, {
    items: items.map((l) => ({ ...l, message: REASON_MESSAGES[l.reason] || l.reason })),
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  });
});

module.exports = { scanTicket, listLogs, REASON_MESSAGES };

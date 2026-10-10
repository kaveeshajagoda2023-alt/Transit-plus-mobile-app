const mongoose = require('mongoose');
const Ticket = require('../models/Ticket');
const Route = require('../models/Route');
const Payment = require('../models/Payment');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { ok, created } = require('../utils/respond');
const { calculateFare } = require('../utils/fare');
const { ticketNumber } = require('../utils/ids');
const { createQrToken, QR_TTL_SECONDS } = require('../utils/qrToken');
const {
  validityWindow,
  cancellationPreview,
  canEdit,
  canHide,
  expireIfNeeded,
  serializeTicket,
} = require('../utils/ticketRules');

const MAX_DAYS_AHEAD = 30;
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const assertTravelDate = (travelDate) => {
  const t = new Date(travelDate).getTime();
  const now = Date.now();
  // Small grace period so "depart now" still works with slightly different phone clocks
  if (t < now - 30 * 60 * 1000) throw new AppError('Travel date cannot be in the past', 400);
  if (t > now + MAX_DAYS_AHEAD * 24 * 60 * 60 * 1000) {
    throw new AppError(`Tickets can be bought up to ${MAX_DAYS_AHEAD} days ahead`, 400);
  }
};

// Insert with a fresh ticket number, retrying on the (rare) duplicate number
const insertTicket = async (data) => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      return await Ticket.create({ ...data, ticketNumber: ticketNumber() });
    } catch (e) {
      if (!(e.code === 11000 && e.keyPattern?.ticketNumber)) throw e;
    }
  }
  throw new AppError('Could not generate a ticket number, please try again', 500);
};

const buildTicket = async ({ user, routeId, fromStop, toStop, passengerType, passengers, travelDate }) => {
  const route = await Route.findById(routeId);
  if (!route || !route.isActive) throw new AppError('Route not found', 404);

  const fare = calculateFare(route, fromStop, toStop, passengerType, passengers);
  const ticket = await insertTicket({
    user: user._id,
    route: route._id,
    fromStop: fare.from,
    toStop: fare.to,
    passengerType,
    passengers,
    unitFare: fare.unitFare,
    totalFare: fare.totalFare,
    travelDate,
    ...validityWindow(travelDate),
    status: 'PENDING_PAYMENT',
  });
  return ticket.populate('route', 'code name stops');
};

// Accepts a Mongo _id or a ticket number; only returns the caller's own ticket
const findOwnedTicket = async (req) => {
  const { id } = req.params;
  const filter = mongoose.isValidObjectId(id) ? { _id: id } : { ticketNumber: id };
  const ticket = await Ticket.findOne({ ...filter, user: req.user._id })
    .populate('route', 'code name stops')
    .populate('payment');
  if (!ticket) throw new AppError('Ticket not found', 404);
  return expireIfNeeded(ticket);
};

// @route POST /api/tickets  -> PENDING_PAYMENT ticket
const createTicket = asyncHandler(async (req, res) => {
  const { routeId, fromStop, toStop, passengers = 1, travelDate } = req.body;
  assertTravelDate(travelDate);
  const ticket = await buildTicket({
    user: req.user,
    routeId,
    fromStop,
    toStop,
    passengerType: req.body.passengerType || req.user.passengerType,
    passengers: Number(passengers),
    travelDate: new Date(travelDate),
  });
  return created(res, serializeTicket(ticket), 'Ticket created - complete payment to activate it');
});

// @route GET /api/tickets?status=ACTIVE,USED&from=&to=&search=&page=&limit=
const listTickets = asyncHandler(async (req, res) => {
  const now = new Date();
  const userId = req.user._id;

  await Ticket.updateMany({ user: userId, status: 'ACTIVE', validUntil: { $lt: now } }, { status: 'EXPIRED' });

  const filter = { user: userId, hiddenFromHistory: false };
  if (req.query.status) filter.status = { $in: req.query.status.split(',') };
  if (req.query.from || req.query.to) {
    filter.travelDate = {};
    if (req.query.from) filter.travelDate.$gte = new Date(req.query.from);
    if (req.query.to) filter.travelDate.$lte = new Date(req.query.to);
  }
  if (req.query.search) {
    const rx = new RegExp(escapeRegex(req.query.search.trim()), 'i');
    const routeIds = await Route.find({ $or: [{ code: rx }, { name: rx }] }).distinct('_id');
    filter.$or = [{ ticketNumber: rx }, { fromStop: rx }, { toStop: rx }, { route: { $in: routeIds } }];
  }

  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 10);
  const [items, total] = await Promise.all([
    Ticket.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('route', 'code name'),
    Ticket.countDocuments(filter),
  ]);

  return ok(res, {
    items: items.map((t) => serializeTicket(t, now)),
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  });
});

// @route GET /api/tickets/:id
const getTicket = asyncHandler(async (req, res) => {
  const ticket = await findOwnedTicket(req);
  return ok(res, serializeTicket(ticket));
});

// @route PUT /api/tickets/:id  body: { travelDate?, passengers? }
const updateTicket = asyncHandler(async (req, res) => {
  const ticket = await findOwnedTicket(req);
  if (!canEdit(ticket)) throw new AppError('This ticket can no longer be changed', 409);

  const { travelDate, passengers } = req.body;

  if (passengers !== undefined && Number(passengers) !== ticket.passengers) {
    // Changing the head count after payment would change the price that was already charged
    if (ticket.status !== 'PENDING_PAYMENT') {
      throw new AppError('Passenger count can only be changed before payment. Cancel and rebook instead.', 409);
    }
    ticket.passengers = Number(passengers);
    ticket.totalFare = ticket.unitFare * ticket.passengers;
  }

  if (travelDate !== undefined) {
    assertTravelDate(travelDate);
    ticket.travelDate = new Date(travelDate);
    Object.assign(ticket, validityWindow(ticket.travelDate));
    ticket.qrVersion += 1; // invalidate QR codes issued for the old time
  }

  await ticket.save();
  return ok(res, serializeTicket(ticket), 'Ticket updated');
});

// @route POST /api/tickets/:id/cancel
const cancelTicket = asyncHandler(async (req, res) => {
  const ticket = await findOwnedTicket(req);
  const preview = cancellationPreview(ticket);
  if (!preview.allowed) throw new AppError(preview.reason, 409);

  const now = new Date();
  const payment = ticket.payment ? await Payment.findById(ticket.payment._id || ticket.payment) : null;

  if (payment && payment.status === 'SUCCESS' && preview.refundAmount > 0) {
    payment.status = 'REFUNDED';
    payment.refundAmount = preview.refundAmount;
    payment.refundedAt = now;
    await payment.save();
  } else if (payment && payment.status === 'PENDING') {
    // Cash-on-board ticket cancelled before boarding: nothing was collected
    payment.status = 'FAILED';
    payment.failureReason = 'Cancelled before boarding';
    await payment.save();
  }

  ticket.status = preview.refundAmount > 0 ? 'REFUNDED' : 'CANCELLED';
  ticket.cancelledAt = now;
  ticket.refundAmount = preview.refundAmount;
  ticket.qrVersion += 1;
  await ticket.save();
  if (payment) ticket.payment = payment;

  return ok(
    res,
    serializeTicket(ticket),
    preview.refundAmount > 0 ? `Ticket cancelled. LKR ${preview.refundAmount} will be refunded.` : 'Ticket cancelled'
  );
});

// @route DELETE /api/tickets/:id  -> soft delete (hide from history)
const hideTicket = asyncHandler(async (req, res) => {
  const ticket = await findOwnedTicket(req);
  if (!canHide(ticket)) {
    throw new AppError('Only used, expired or cancelled tickets can be removed from history', 409);
  }
  ticket.hiddenFromHistory = true;
  await ticket.save();
  return ok(res, { _id: ticket._id }, 'Ticket removed from history');
});

// @route POST /api/tickets/:id/rebook  body: { travelDate? }  -> new PENDING_PAYMENT ticket
const rebookTicket = asyncHandler(async (req, res) => {
  const original = await findOwnedTicket(req);
  const travelDate = req.body.travelDate ? new Date(req.body.travelDate) : new Date();
  assertTravelDate(travelDate);
  const ticket = await buildTicket({
    user: req.user,
    routeId: original.route._id,
    fromStop: original.fromStop,
    toStop: original.toStop,
    passengerType: original.passengerType,
    passengers: original.passengers,
    travelDate,
  });
  return created(res, serializeTicket(ticket), 'Trip rebooked - complete payment to activate it');
});

const issueQr = (res, ticket) => {
  const qr = createQrToken(ticket);
  return ok(res, {
    token: qr.token,
    qrVersion: qr.qrVersion,
    issuedAt: qr.issuedAt,
    expiresAt: qr.expiresAt,
    ttlSeconds: QR_TTL_SECONDS,
    serverTime: Date.now(),
  });
};

const assertQrAvailable = (ticket) => {
  if (ticket.status !== 'ACTIVE') {
    throw new AppError(`A QR code is only available for active tickets (this one is ${ticket.status})`, 409);
  }
};

// @route GET /api/tickets/:id/qr
const getQr = asyncHandler(async (req, res) => {
  const ticket = await findOwnedTicket(req);
  assertQrAvailable(ticket);
  return issueQr(res, ticket);
});

// @route POST /api/tickets/:id/qr/rotate
const rotateQr = asyncHandler(async (req, res) => {
  const ticket = await findOwnedTicket(req);
  assertQrAvailable(ticket);
  ticket.qrVersion += 1;
  await ticket.save();
  return issueQr(res, ticket);
});

module.exports = {
  createTicket,
  listTickets,
  getTicket,
  updateTicket,
  cancelTicket,
  hideTicket,
  rebookTicket,
  getQr,
  rotateQr,
};

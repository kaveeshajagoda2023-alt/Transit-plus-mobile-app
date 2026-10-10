const mongoose = require('mongoose');
const Payment = require('../models/Payment');
const Ticket = require('../models/Ticket');
const SavedPaymentMethod = require('../models/SavedPaymentMethod');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { ok, created } = require('../utils/respond');
const { transactionRef, receiptNumber } = require('../utils/ids');
const { validateCard, authorize, isExpired } = require('../utils/cardGateway');
const { serializeTicket } = require('../utils/ticketRules');

const findOwnedMethod = async (req, id = req.params.id) => {
  if (!mongoose.isValidObjectId(id)) throw new AppError('Payment method not found', 404);
  const method = await SavedPaymentMethod.findOne({ _id: id, user: req.user._id });
  if (!method) throw new AppError('Payment method not found', 404);
  return method;
};

// Saves brand/last4/expiry only, skipping exact duplicates
const saveCardSummary = async (userId, summary, holderName = '', makeDefault = false) => {
  const existing = await SavedPaymentMethod.findOne({ user: userId, ...summary });
  if (existing) return existing;
  const count = await SavedPaymentMethod.countDocuments({ user: userId });
  const isDefault = makeDefault || count === 0;
  if (isDefault) await SavedPaymentMethod.updateMany({ user: userId }, { isDefault: false });
  return SavedPaymentMethod.create({ user: userId, ...summary, holderName, isDefault });
};

// @route POST /api/payments/checkout
// body: { ticketId, method: CARD|WALLET|CASH_ON_BOARD, savedMethodId? , card?: {cardNumber, expiry, cvv, holderName}, saveCard? }
const checkout = asyncHandler(async (req, res) => {
  const { ticketId, method, savedMethodId, card, saveCard } = req.body;

  const ticket = await Ticket.findOne({ _id: ticketId, user: req.user._id }).populate('route', 'code name');
  if (!ticket) throw new AppError('Ticket not found', 404);
  if (ticket.status !== 'PENDING_PAYMENT') throw new AppError('This ticket has already been paid or closed', 409);
  if (ticket.validUntil < new Date()) throw new AppError('This trip time has passed. Please choose a new time.', 409);

  let cardSummary = null;
  if (method === 'CARD') {
    if (savedMethodId) {
      const saved = await findOwnedMethod(req, savedMethodId);
      if (isExpired(saved.expiry)) throw new AppError('This saved card has expired. Add a new card.', 422);
      cardSummary = { brand: saved.brand, last4: saved.last4, expiry: saved.expiry };
    } else if (card) {
      cardSummary = validateCard(card); // throws 422 with field errors
    } else {
      throw new AppError('Enter card details or choose a saved card', 400);
    }
  }

  const payment = new Payment({
    ticket: ticket._id,
    user: req.user._id,
    amount: ticket.totalFare,
    method,
    status: 'PENDING',
    cardBrand: cardSummary?.brand,
    cardLast4: cardSummary?.last4,
    transactionRef: transactionRef(),
  });

  const decision = method === 'CASH_ON_BOARD' ? { approved: true } : authorize({ method, last4: cardSummary?.last4 });

  if (!decision.approved) {
    payment.status = 'FAILED';
    payment.failureReason = decision.reason;
    await payment.save();
    return res.status(402).json({
      success: false,
      message: decision.reason,
      data: { payment, ticket: serializeTicket(ticket) },
    });
  }

  // Cash is collected by the conductor, so the payment stays PENDING until the ticket is scanned
  payment.status = method === 'CASH_ON_BOARD' ? 'PENDING' : 'SUCCESS';
  payment.receiptNumber = receiptNumber();
  await payment.save();

  ticket.status = 'ACTIVE';
  ticket.payment = payment._id;
  await ticket.save();

  let savedMethod = null;
  if (method === 'CARD' && !savedMethodId && saveCard) {
    savedMethod = await saveCardSummary(req.user._id, cardSummary, card.holderName);
  }

  ticket.payment = payment;
  return created(
    res,
    { payment, ticket: serializeTicket(ticket), savedMethod },
    method === 'CASH_ON_BOARD' ? 'Ticket reserved - pay the conductor when boarding' : 'Payment successful'
  );
});

// @route GET /api/payments?page=&limit=
const listPayments = asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 20);
  const filter = { user: req.user._id };
  const [items, total] = await Promise.all([
    Payment.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate({ path: 'ticket', select: 'ticketNumber fromStop toStop route', populate: { path: 'route', select: 'code name' } }),
    Payment.countDocuments(filter),
  ]);
  return ok(res, { items, page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) });
});

// @route GET /api/payments/:id  (receipt)
const getPayment = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new AppError('Payment not found', 404);
  const payment = await Payment.findOne({ _id: req.params.id, user: req.user._id }).populate({
    path: 'ticket',
    populate: { path: 'route', select: 'code name' },
  });
  if (!payment) throw new AppError('Payment not found', 404);
  return ok(res, payment);
});

// @route GET /api/payments/methods
const listMethods = asyncHandler(async (req, res) => {
  const methods = await SavedPaymentMethod.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
  return ok(res, methods);
});

// @route POST /api/payments/methods  body: { cardNumber, expiry, cvv, holderName?, makeDefault? }
const addMethod = asyncHandler(async (req, res) => {
  const summary = validateCard(req.body);
  const method = await saveCardSummary(req.user._id, summary, req.body.holderName, req.body.makeDefault);
  return created(res, method, 'Card saved');
});

// @route PUT /api/payments/methods/:id  body: { holderName?, expiry? }
const updateMethod = asyncHandler(async (req, res) => {
  const method = await findOwnedMethod(req);
  if (req.body.expiry !== undefined) {
    if (isExpired(req.body.expiry)) {
      throw new AppError('Expiry date is not valid', 422, [{ field: 'expiry', message: 'Card has expired or date is invalid' }]);
    }
    method.expiry = req.body.expiry;
  }
  if (req.body.holderName !== undefined) method.holderName = req.body.holderName;
  await method.save();
  return ok(res, method, 'Card updated');
});

// @route PUT /api/payments/methods/:id/default
const setDefaultMethod = asyncHandler(async (req, res) => {
  const method = await findOwnedMethod(req);
  await SavedPaymentMethod.updateMany({ user: req.user._id }, { isDefault: false });
  method.isDefault = true;
  await method.save();
  return ok(res, method, `${method.brand} •••• ${method.last4} is now your default card`);
});

// @route DELETE /api/payments/methods/:id
const deleteMethod = asyncHandler(async (req, res) => {
  const method = await findOwnedMethod(req);
  await method.deleteOne();
  if (method.isDefault) {
    // Promote the newest remaining card so there is always a default
    const next = await SavedPaymentMethod.findOne({ user: req.user._id }).sort({ createdAt: -1 });
    if (next) {
      next.isDefault = true;
      await next.save();
    }
  }
  return ok(res, { _id: method._id }, 'Card removed');
});

module.exports = {
  checkout,
  listPayments,
  getPayment,
  listMethods,
  addMethod,
  updateMethod,
  setDefaultMethod,
  deleteMethod,
};

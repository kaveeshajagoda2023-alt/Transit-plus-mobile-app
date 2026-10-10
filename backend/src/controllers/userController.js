const User = require('../models/User');
const Ticket = require('../models/Ticket');
const Payment = require('../models/Payment');
const SavedPaymentMethod = require('../models/SavedPaymentMethod');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/respond');

// @route GET /api/users/me
const getMe = asyncHandler(async (req, res) => {
  const [activeTickets, completedTrips, savedMethods] = await Promise.all([
    Ticket.countDocuments({ user: req.user._id, status: 'ACTIVE' }),
    Ticket.countDocuments({ user: req.user._id, status: 'USED' }),
    SavedPaymentMethod.countDocuments({ user: req.user._id }),
  ]);
  return ok(res, { user: req.user, stats: { activeTickets, completedTrips, savedMethods } });
});

// @route PUT /api/users/me  (email and role cannot be changed here)
const updateMe = asyncHandler(async (req, res) => {
  const allowed = ['name', 'phone', 'passengerType', 'preferredLanguage'];
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) req.user[field] = req.body[field];
  });
  await req.user.save();
  return ok(res, { user: req.user }, 'Profile updated');
});

// @route DELETE /api/users/me  body: { password }
const deleteMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+passwordHash');
  if (!(await user.checkPassword(req.body.password))) {
    throw new AppError('Password is incorrect', 401);
  }

  await Promise.all([
    SavedPaymentMethod.deleteMany({ user: user._id }),
    Payment.deleteMany({ user: user._id }),
    Ticket.deleteMany({ user: user._id }),
  ]);
  await user.deleteOne();
  return ok(res, null, 'Account deleted');
});

module.exports = { getMe, updateMe, deleteMe };

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const signToken = (user) =>
  jwt.sign({ sub: String(user._id) }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// Verifies "Authorization: Bearer <jwt>" and loads req.user
const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new AppError('Not authorized, please log in', 401);
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    throw new AppError('Your session has expired, please log in again', 401);
  }

  const user = await User.findById(decoded.sub);
  if (!user) throw new AppError('Account no longer exists', 401);

  req.user = user;
  next();
});

// Use after protect, e.g. requireRole('conductor', 'admin')
const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) return next(new AppError('You do not have access to this action', 403));
  return next();
};

module.exports = { protect, requireRole, signToken };

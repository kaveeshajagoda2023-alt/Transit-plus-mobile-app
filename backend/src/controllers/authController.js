const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { ok, created } = require('../utils/respond');
const { signToken } = require('../middleware/authMiddleware');

// @route POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password, passengerType, preferredLanguage } = req.body;

  const exists = await User.exists({ email: email.toLowerCase() });
  if (exists) throw new AppError('An account with this email already exists', 409);

  const user = await User.create({
    name,
    email,
    phone,
    passengerType,
    preferredLanguage,
    passwordHash: await User.hashPassword(password),
  });

  return created(res, { token: signToken(user), user }, 'Account created');
});

// @route POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');

  // Same message for unknown email and wrong password so accounts can't be enumerated
  if (!user || !(await user.checkPassword(password))) {
    throw new AppError('Email or password is incorrect', 401);
  }

  return ok(res, { token: signToken(user), user }, 'Logged in');
});

module.exports = { register, login };

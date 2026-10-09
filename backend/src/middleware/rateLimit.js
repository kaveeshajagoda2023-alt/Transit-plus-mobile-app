const rateLimit = require('express-rate-limit');

const make = (windowMinutes, max, message) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => process.env.NODE_ENV === 'test',
    message: { success: false, message },
  });

// Slows down password guessing
const authLimiter = make(15, 30, 'Too many login attempts. Please wait a few minutes and try again.');
// Stops accidental double-tap storms on the pay button
const checkoutLimiter = make(1, 10, 'Too many payment attempts. Please wait a minute and try again.');

module.exports = { authLimiter, checkoutLimiter };

const express = require('express');
const { body } = require('express-validator');
const { register, login } = require('../controllers/authController');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimit');
const { PASSENGER_TYPES, LANGUAGES } = require('../models/User');

const router = express.Router();

router.post(
  '/register',
  authLimiter,
  [
    body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Name must be 2-80 characters'),
    body('email').trim().isEmail().withMessage('Enter a valid email address'),
    body('phone')
      .optional({ values: 'falsy' })
      .matches(/^\+?[0-9 ]{9,15}$/)
      .withMessage('Enter a valid phone number'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/\d/).withMessage('Password must contain a number'),
    body('passengerType').optional().isIn(PASSENGER_TYPES).withMessage('Invalid passenger type'),
    body('preferredLanguage').optional().isIn(LANGUAGES).withMessage('Invalid language'),
  ],
  validate,
  register
);

router.post(
  '/login',
  authLimiter,
  [
    body('email').trim().isEmail().withMessage('Enter a valid email address'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

module.exports = router;

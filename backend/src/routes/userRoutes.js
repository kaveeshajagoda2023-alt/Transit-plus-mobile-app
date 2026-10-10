const express = require('express');
const { body } = require('express-validator');
const { getMe, updateMe, deleteMe } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { PASSENGER_TYPES, LANGUAGES } = require('../models/User');

const router = express.Router();

router.use(protect);

router.get('/me', getMe);

router.put(
  '/me',
  [
    body('name').optional().trim().isLength({ min: 2, max: 80 }).withMessage('Name must be 2-80 characters'),
    body('phone')
      .optional({ values: 'falsy' })
      .matches(/^\+?[0-9 ]{9,15}$/)
      .withMessage('Enter a valid phone number'),
    body('passengerType').optional().isIn(PASSENGER_TYPES).withMessage('Invalid passenger type'),
    body('preferredLanguage').optional().isIn(LANGUAGES).withMessage('Invalid language'),
  ],
  validate,
  updateMe
);

router.delete(
  '/me',
  [body('password').notEmpty().withMessage('Enter your password to confirm')],
  validate,
  deleteMe
);

module.exports = router;

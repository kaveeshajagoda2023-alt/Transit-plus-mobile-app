const express = require('express');
const { body, param, query } = require('express-validator');
const {
  checkout,
  listPayments,
  getPayment,
  listMethods,
  addMethod,
  updateMethod,
  setDefaultMethod,
  deleteMethod,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { checkoutLimiter } = require('../middleware/rateLimit');

const router = express.Router();

router.use(protect);

// `condition` (optional) must come first: .if() only guards the validators after it
const cardRules = (prefix = '', condition = null) => {
  const field = (name) => (condition ? body(`${prefix}${name}`).if(condition) : body(`${prefix}${name}`));
  return [
    field('cardNumber').trim().notEmpty().withMessage('Card number is required'),
    field('expiry').trim().matches(/^\d{2}\/\d{2}$/).withMessage('Expiry must be MM/YY'),
    field('cvv').trim().matches(/^\d{3,4}$/).withMessage('CVV must be 3 or 4 digits'),
    field('holderName').optional().trim().isLength({ max: 60 }),
  ];
};
const methodId = param('id').isMongoId().withMessage('Invalid payment method id');

// POST /api/payments/checkout - mock gateway
router.post(
  '/checkout',
  checkoutLimiter,
  [
    body('ticketId').isMongoId().withMessage('ticketId is required'),
    body('method').isIn(['CARD', 'WALLET', 'CASH_ON_BOARD']).withMessage('Choose a payment method'),
    body('savedMethodId').optional().isMongoId().withMessage('Invalid saved card'),
    body('saveCard').optional().isBoolean(),
    // Full card details are only required when paying with a new card
    ...cardRules('card.', body('card').exists()),
  ],
  validate,
  checkout
);

// Saved payment methods (declared before /:id so "methods" is not treated as an id)
router.get('/methods', listMethods);
router.post('/methods', [...cardRules(), body('makeDefault').optional().isBoolean()], validate, addMethod);
router.put(
  '/methods/:id',
  [
    methodId,
    body('expiry').optional().trim().matches(/^\d{2}\/\d{2}$/).withMessage('Expiry must be MM/YY'),
    body('holderName').optional().trim().isLength({ max: 60 }),
  ],
  validate,
  updateMethod
);
router.put('/methods/:id/default', [methodId], validate, setDefaultMethod);
router.delete('/methods/:id', [methodId], validate, deleteMethod);

// Payment history + receipt
router.get(
  '/',
  [query('page').optional().isInt({ min: 1 }), query('limit').optional().isInt({ min: 1, max: 50 })],
  validate,
  listPayments
);
router.get('/:id', [param('id').isMongoId().withMessage('Invalid payment id')], validate, getPayment);

module.exports = router;

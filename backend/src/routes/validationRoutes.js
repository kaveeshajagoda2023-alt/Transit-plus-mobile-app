const express = require('express');
const { body, query } = require('express-validator');
const { scanTicket, listLogs } = require('../controllers/validationController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { SCAN_RESULTS } = require('../models/ScanLog');

const router = express.Router();

router.use(protect);

router.post(
  '/scan',
  [body('token').isString().trim().notEmpty().withMessage('QR token is required').isLength({ max: 1000 })],
  validate,
  scanTicket
);

router.get(
  '/logs',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('result').optional().isIn(SCAN_RESULTS),
  ],
  validate,
  listLogs
);

module.exports = router;

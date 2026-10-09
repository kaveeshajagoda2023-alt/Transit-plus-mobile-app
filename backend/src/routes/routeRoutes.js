const express = require('express');
const { param, query } = require('express-validator');
const { listRoutes, getFare } = require('../controllers/routeController');
const validate = require('../middleware/validate');

const router = express.Router();

// Route and fare data is public so other members' modules (e.g. Search & ETA) can reuse it
router.get('/', [query('search').optional().isString().isLength({ max: 60 })], validate, listRoutes);

router.get(
  '/:id/fare',
  [
    param('id').isMongoId().withMessage('Invalid route id'),
    query('from').trim().notEmpty().withMessage('Boarding stop is required'),
    query('to').trim().notEmpty().withMessage('Destination stop is required'),
    query('type').optional().isIn(['adult', 'student', 'senior', 'child']).withMessage('Invalid passenger type'),
    query('passengers').optional().isInt({ min: 1, max: 10 }).withMessage('Passengers must be between 1 and 10'),
  ],
  validate,
  getFare
);

module.exports = router;

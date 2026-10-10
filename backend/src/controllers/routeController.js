const Route = require('../models/Route');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/respond');
const { calculateFare } = require('../utils/fare');

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// @route GET /api/routes?search=
const listRoutes = asyncHandler(async (req, res) => {
  const filter = { isActive: true };
  if (req.query.search) {
    const rx = new RegExp(escapeRegex(req.query.search.trim()), 'i');
    filter.$or = [{ code: rx }, { name: rx }, { stops: rx }];
  }
  const routes = await Route.find(filter).sort({ code: 1 });
  return ok(res, routes);
});

// @route GET /api/routes/:id/fare?from=&to=&type=&passengers=
const getFare = asyncHandler(async (req, res) => {
  const route = await Route.findById(req.params.id);
  if (!route) throw new AppError('Route not found', 404);

  const { from, to, type = 'adult' } = req.query;
  const passengers = Number(req.query.passengers || 1);
  const fare = calculateFare(route, from, to, type, passengers);
  return ok(res, { route: { _id: route._id, code: route.code, name: route.name }, ...fare });
});

module.exports = { listRoutes, getFare };

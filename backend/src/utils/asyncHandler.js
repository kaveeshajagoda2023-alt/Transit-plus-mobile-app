// Express 4 does not forward rejected promises to the error handler,
// so every async controller is wrapped with this helper.
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;

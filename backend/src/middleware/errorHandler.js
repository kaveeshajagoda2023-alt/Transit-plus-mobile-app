// 404 for unknown routes
const notFound = (req, res) => {
  res.status(404).json({ success: false, message: `API Route Not Found - ${req.originalUrl}` });
};

// Central error handler: maps known error types to friendly messages + HTTP codes
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let status = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.details;

  if (err.name === 'CastError') {
    status = 400;
    message = `Invalid ${err.path}`;
  } else if (err.name === 'ValidationError') {
    status = 400;
    errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    message = errors[0]?.message || 'Validation failed';
  } else if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'value';
    message = field === 'email' ? 'An account with this email already exists' : `Duplicate ${field}`;
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Request body is not valid JSON';
  }

  if (status >= 500) {
    console.error('[Server Error]', err.stack);
    if (process.env.NODE_ENV !== 'development') message = 'Internal Server Error';
  }

  res.status(status).json({ success: false, message, ...(errors ? { errors } : {}) });
};

module.exports = { notFound, errorHandler };

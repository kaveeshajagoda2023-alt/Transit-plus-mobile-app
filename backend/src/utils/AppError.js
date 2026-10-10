// Error with an HTTP status code. Thrown from controllers and turned into
// a { success:false, message } response by the central error handler.
class AppError extends Error {
  constructor(message, statusCode = 400, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

module.exports = AppError;

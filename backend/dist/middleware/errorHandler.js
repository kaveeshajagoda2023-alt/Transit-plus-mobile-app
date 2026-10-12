import { logger } from '../utils/logger.js';
export function errorHandler(err, req, res, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
next) {
    logger.error(`Error in ${req.method} ${req.originalUrl}:`, err.message);
    res.status(500).json({
        success: false,
        error: err.message || 'Internal server error occurred.',
    });
}
export function notFoundHandler(req, res) {
    res.status(404).json({
        success: false,
        error: `Endpoint not found: ${req.method} ${req.originalUrl}`,
    });
}

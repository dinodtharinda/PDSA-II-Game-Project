const logger = require('../utils/logger');

/**
 * Global error handling middleware
 * @param {Error} err - Error object
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error(`${err.name}: ${err.message}`);
  logger.error(err.stack);

  // Set default status code and message
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Send response based on request type
  if (req.xhr || req.headers.accept.indexOf('json') > -1) {
    // For AJAX or API requests
    return res.status(statusCode).json({
      error: {
        message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      }
    });
  }

  // For regular page requests, render an error page
  res.status(statusCode);
  res.render('pages/error', {
    message,
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
};

module.exports = errorHandler;
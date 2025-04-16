const logger = require('../utils/logger');

/**
 * Authentication middleware for protecting routes
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next function
 */
const authenticate = (req, res, next) => {
  // For this game project, we'll use a simple session-based auth
  // In a production app, you would implement JWT or other auth strategies
  
  if (req.session && req.session.userId) {
    // User is authenticated
    logger.info(`Authenticated request from user ${req.session.userId}`);
    return next();
  }
  
  // For API requests, send a 401 Unauthorized response
  if (req.xhr || req.headers.accept.indexOf('json') > -1) {
    logger.warn('Unauthenticated API request');
    return res.status(401).json({
      error: {
        message: 'Authentication required'
      }
    });
  }
  
  // For page requests, redirect to the login page
  logger.warn('Unauthenticated page request, redirecting to login');
  res.redirect('/login');
};

module.exports = authenticate;
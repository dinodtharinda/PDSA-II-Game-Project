import logger from '../utils/logger.js';
import Player from '../models/player.js';

/**
 * Authentication middleware
 */
async function authenticate(req, res, next) {
  try {
    // Check for session
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get user from database
    const user = await Player.findByPk(req.session.userId);
    if (!user) {
      req.session.destroy();
      return res.status(401).json({ error: 'Invalid session' });
    }

    // Check if user is verified
    if (!user.verified) {
      return res.status(403).json({ error: 'Please verify your email' });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (err) {
    logger.error(`Authentication error: ${err.message}`);
    next(err);
  }
}

export default authenticate;
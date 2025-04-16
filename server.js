// Server initialization
const app = require('./app');
const db = require('./src/config/db');
const logger = require('./src/utils/logger');

// Define port
const PORT = process.env.PORT || 3000;

// Test database connection
db.authenticate()
  .then(() => {
    logger.info('Database connection established');
    // Start server
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    logger.error('Database connection error:', err);
  });
  
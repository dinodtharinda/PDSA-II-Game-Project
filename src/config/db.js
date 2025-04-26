import { Sequelize } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';
import config from './index.js';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let sequelize;

export const initializeDatabase = async () => {
  if (!sequelize) {
    try {
      sequelize = new Sequelize({
        dialect: config.db.options.dialect,
        storage: path.resolve(__dirname, '../../', config.db.path),
        logging: (msg) => config.db.options.logging ? logger.debug(msg) : null,
        ...config.db.options
      });

      // Test the connection
      await sequelize.authenticate();
      logger.info('Database connection established successfully.');
    } catch (error) {
      logger.error('Unable to connect to the database:', error);
      throw error;
    }
  }
  return sequelize;
};

export const getSequelize = () => {
  if (!sequelize) {
    throw new Error('Database connection not initialized. Call initializeDatabase() first.');
  }
  return sequelize;
};

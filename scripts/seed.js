// Database seed script
const sequelize = require('../src/config/db');
const Player = require('../src/models/player');
const Game = require('../src/models/game');
const logger = require('../src/utils/logger');

async function seed() {
  try {
    // Sync models with database
    await sequelize.sync({ force: true });
    logger.info('Database tables created!');

    // Create sample players
    await Player.bulkCreate([
      { name: 'Player 1' },
      { name: 'Player 2' },
      { name: 'Player 3' }
    ]);
    logger.info('Sample players created!');

    // Exit process
    process.exit(0);
  } catch (error) {
    logger.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();

// Database connection configuration
const { Sequelize } = require('sequelize');
const path = require('path');

const dbPath = path.join(__dirname, '../../database/game.db');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false
});

module.exports = sequelize;

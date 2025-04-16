/**
 * Database migrations script
 * This script creates all necessary tables for the game project
 */
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const logger = require('../../src/utils/logger');

// Connect to database
const dbPath = path.join(__dirname, '..', 'game.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    logger.error(`Database connection error: ${err.message}`);
    process.exit(1);
  }
  logger.info(`Connected to database: ${dbPath}`);
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Create tables
const createTables = () => {
  logger.info('Creating database tables...');

  // Players table
  db.run(`
    CREATE TABLE IF NOT EXISTS players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      logger.error(`Error creating players table: ${err.message}`);
      return;
    }
    logger.info('Players table created successfully');
  });

  // Games table
  db.run(`
    CREATE TABLE IF NOT EXISTS games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_type TEXT NOT NULL,
      start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      end_time TIMESTAMP,
      player_id INTEGER,
      result TEXT,
      FOREIGN KEY (player_id) REFERENCES players (id)
    )
  `, (err) => {
    if (err) {
      logger.error(`Error creating games table: ${err.message}`);
      return;
    }
    logger.info('Games table created successfully');
  });

  // TicTacToe table
  db.run(`
    CREATE TABLE IF NOT EXISTS tic_tac_toe (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_id INTEGER NOT NULL,
      algorithm_type TEXT NOT NULL,
      move_time REAL NOT NULL,
      move_number INTEGER NOT NULL,
      FOREIGN KEY (game_id) REFERENCES games (id)
    )
  `, (err) => {
    if (err) {
      logger.error(`Error creating tic_tac_toe table: ${err.message}`);
      return;
    }
    logger.info('TicTacToe table created successfully');
  });

  // TravelingSalesman table
  db.run(`
    CREATE TABLE IF NOT EXISTS traveling_salesman (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_id INTEGER NOT NULL,
      home_city TEXT NOT NULL,
      selected_cities TEXT NOT NULL,
      shortest_route TEXT NOT NULL,
      algorithm_type TEXT NOT NULL,
      execution_time REAL NOT NULL,
      FOREIGN KEY (game_id) REFERENCES games (id)
    )
  `, (err) => {
    if (err) {
      logger.error(`Error creating traveling_salesman table: ${err.message}`);
      return;
    }
    logger.info('TravelingSalesman table created successfully');
  });

  // TowerOfHanoi table
  db.run(`
    CREATE TABLE IF NOT EXISTS tower_of_hanoi (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_id INTEGER NOT NULL,
      disk_count INTEGER NOT NULL,
      move_count INTEGER NOT NULL,
      move_sequence TEXT NOT NULL,
      algorithm_type TEXT NOT NULL,
      execution_time REAL NOT NULL,
      FOREIGN KEY (game_id) REFERENCES games (id)
    )
  `, (err) => {
    if (err) {
      logger.error(`Error creating tower_of_hanoi table: ${err.message}`);
      return;
    }
    logger.info('TowerOfHanoi table created successfully');
  });

  // EightQueens table
  db.run(`
    CREATE TABLE IF NOT EXISTS eight_queens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_id INTEGER NOT NULL,
      solution TEXT NOT NULL,
      solution_number INTEGER NOT NULL,
      algorithm_type TEXT NOT NULL,
      execution_time REAL NOT NULL,
      is_identified BOOLEAN DEFAULT FALSE,
      FOREIGN KEY (game_id) REFERENCES games (id)
    )
  `, (err) => {
    if (err) {
      logger.error(`Error creating eight_queens table: ${err.message}`);
      return;
    }
    logger.info('EightQueens table created successfully');
  });

  // KnightsTour table
  db.run(`
    CREATE TABLE IF NOT EXISTS knights_tour (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_id INTEGER NOT NULL,
      start_position TEXT NOT NULL,
      move_sequence TEXT NOT NULL,
      algorithm_type TEXT NOT NULL,
      execution_time REAL NOT NULL,
      FOREIGN KEY (game_id) REFERENCES games (id)
    )
  `, (err) => {
    if (err) {
      logger.error(`Error creating knights_tour table: ${err.message}`);
      return;
    }
    logger.info('KnightsTour table created successfully');
  });
};

// Run migrations
createTables();

// Close database connection after migrations complete
setTimeout(() => {
  db.close((err) => {
    if (err) {
      logger.error(`Error closing database: ${err.message}`);
      return;
    }
    logger.info('Database connection closed');
  });
}, 1000);

module.exports = { createTables };
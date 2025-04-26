/**
 * Models index file
 * Central export point for all database models with async initialization support
 */
import gameExport from './game.js';
import playerExport from './player.js';
import performanceExport from './performance.js';

// Export the initialization functions
export const initModels = async () => {
  // Initialize all models
  const Player = await playerExport.initModel();
  const Game = await gameExport.initModel();
  const Performance = await performanceExport.initModel();

  // Store models in a dictionary
  const models = {
    Player,
    Game,
    Performance
  };

  // Initialize associations with all models available
  playerExport.associate(models);
  gameExport.associate(models);
  performanceExport.associate(models);

  return models;
};

// For backward compatibility with code that expects immediate model access
export const Game = gameExport;
export const Player = playerExport;
export const Performance = performanceExport;

// Export a default object for convenient imports
export default {
  initModels,
  Game: gameExport,
  Player: playerExport,
  Performance: performanceExport
};
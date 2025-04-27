/**
 * Models index file
 * Central export point for all database models with async initialization support
 */
import gameExport from './game.js';
import playerExport from './player.js';
import performanceExport from './performance.js';

// Keep track of initialized models
let initializedModels = null;

// Export the initialization function
export const initModels = async () => {
  if (initializedModels) {
    return initializedModels; // Return cached models if already initialized
  }

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

  initializedModels = models; // Cache the initialized models
  return models;
};
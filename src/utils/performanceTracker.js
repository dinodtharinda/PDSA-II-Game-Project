/**
 * Performance tracking utility for game modules
 * Provides consistent tracking of algorithm performance metrics across different games
 */
import { Performance } from '../models/index.js';
import logger from './logger.js';

/**
 * Track algorithm performance metrics and save to database
 * @param {Object} options - Performance tracking options
 * @param {number} options.gameId - The ID of the game
 * @param {string} options.algorithmName - Name of the algorithm
 * @param {number} options.executionTime - Execution time in seconds
 * @param {number} [options.memoryUsed] - Memory used in bytes (if available)
 * @param {number} [options.iterations] - Number of iterations or steps
 * @param {number|string} [options.solutionQuality] - Quality metric (e.g., path length for TSP)
 * @param {Object} [options.parameters] - Algorithm-specific parameters
 * @returns {Promise<Object>} The saved performance record
 */
export const trackPerformance = async (options) => {
  try {
    // Validate required options
    const requiredFields = ['gameId', 'algorithmName', 'executionTime'];
    for (const field of requiredFields) {
      if (!options[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Create performance record
    const performanceRecord = await Performance.create({
      game_id: options.gameId,
      algorithm_name: options.algorithmName,
      execution_time: options.executionTime,
      memory_used: options.memoryUsed,
      iterations: options.iterations,
      solution_quality: options.solutionQuality,
      parameters: options.parameters || {}
    });
    
    logger.info(`Performance tracked for algorithm ${options.algorithmName} on game ${options.gameId}`);
    return performanceRecord;
  } catch (error) {
    logger.error(`Error tracking algorithm performance: ${error.message}`);
    // Don't throw the error - allow the game to continue even if metrics saving fails
    return null;
  }
};

/**
 * Update game record with algorithm results
 * @param {Object} options - Game update options
 * @param {number} options.gameId - The ID of the game
 * @param {string} options.algorithmName - Name of the algorithm used
 * @param {boolean} options.solutionFound - Whether a solution was found
 * @param {number} options.executionTime - Execution time in seconds
 * @param {string} [options.status='completed'] - Game status
 * @param {Object} [options.gameSpecificData] - Game-specific data to store
 * @returns {Promise<boolean>} Success status
 */
export const updateGameWithAlgorithmResults = async (options) => {
  try {
    const { Game } = await import('../models/index.js');
    
    // Update the game record
    const game = await Game.findByPk(options.gameId);
    if (!game) {
      logger.warn(`Game with ID ${options.gameId} not found`);
      return false;
    }
    
    await game.update({
      algorithm_used: options.algorithmName,
      solution_found: options.solutionFound,
      execution_time: options.executionTime,
      status: options.status || 'completed',
      end_time: new Date(),
      // Calculate duration
      duration_seconds: Math.floor((new Date() - new Date(game.start_time)) / 1000)
    });
    
    logger.info(`Game ${options.gameId} updated with algorithm results`);
    return true;
  } catch (error) {
    logger.error(`Error updating game with algorithm results: ${error.message}`);
    return false;
  }
};

/**
 * Comprehensive function to track both performance metrics and update game record
 * @param {Object} options - All tracking options
 * @returns {Promise<Object>} Result object with success status
 */
export const trackAlgorithmPerformance = async (options) => {
  const result = {
    performanceTracked: false,
    gameUpdated: false
  };
  
  try {
    // Track performance metrics
    const performanceRecord = await trackPerformance(options);
    result.performanceTracked = !!performanceRecord;
    
    // Update game record
    const gameUpdated = await updateGameWithAlgorithmResults({
      gameId: options.gameId,
      algorithmName: options.algorithmName,
      solutionFound: options.solutionFound !== undefined ? options.solutionFound : true,
      executionTime: options.executionTime,
      status: options.status,
      gameSpecificData: options.gameSpecificData
    });
    result.gameUpdated = gameUpdated;
    
    return result;
  } catch (error) {
    logger.error(`Error in trackAlgorithmPerformance: ${error.message}`);
    return result;
  }
};

/**
 * Get performance statistics for a specific algorithm
 * @param {string} gameType - Type of game
 * @param {string} algorithmName - Name of the algorithm
 * @returns {Promise<Object>} Statistics object
 */
export const getAlgorithmStats = async (gameType, algorithmName) => {
  try {
    const { sequelize } = await import('../config/db.js');
    
    const [results] = await sequelize.query(`
      SELECT 
        COUNT(*) as totalUses,
        AVG(p.execution_time) as averageExecutionTime,
        MIN(p.execution_time) as fastestRun,
        MAX(p.execution_time) as slowestRun,
        SUM(CASE WHEN p.execution_time < 0.05 THEN 1 ELSE 0 END) as under50ms,
        SUM(CASE WHEN p.execution_time >= 0.05 AND p.execution_time < 0.1 THEN 1 ELSE 0 END) as under100ms,
        SUM(CASE WHEN p.execution_time >= 0.1 AND p.execution_time < 0.2 THEN 1 ELSE 0 END) as under200ms,
        SUM(CASE WHEN p.execution_time >= 0.2 THEN 1 ELSE 0 END) as over200ms
      FROM 
        performances p
      JOIN 
        games g ON p.game_id = g.id
      WHERE 
        g.game_type = ? AND p.algorithm_name = ?
    `, {
      replacements: [gameType, algorithmName],
      type: sequelize.QueryTypes.SELECT
    });
    
    return {
      gameType,
      algorithm: algorithmName,
      totalUses: parseInt(results.totalUses || 0),
      averageExecutionTime: parseFloat(results.averageExecutionTime || 0),
      fastestRun: parseFloat(results.fastestRun || 0),
      slowestRun: parseFloat(results.slowestRun || 0),
      timeDistribution: {
        under50ms: parseInt(results.under50ms || 0),
        under100ms: parseInt(results.under100ms || 0),
        under200ms: parseInt(results.under200ms || 0),
        over200ms: parseInt(results.over200ms || 0)
      }
    };
  } catch (error) {
    logger.error(`Error getting algorithm stats: ${error.message}`);
    return {
      gameType,
      algorithm: algorithmName,
      totalUses: 0,
      averageExecutionTime: 0,
      fastestRun: 0,
      slowestRun: 0,
      timeDistribution: {
        under50ms: 0,
        under100ms: 0,
        under200ms: 0,
        over200ms: 0
      }
    };
  }
};

export default {
  trackPerformance,
  updateGameWithAlgorithmResults,
  trackAlgorithmPerformance,
  getAlgorithmStats
};
/**
 * TSP (Traveling Salesman Problem) API Service
 * Handles database interactions for the TSP game
 */

import { execute, query, createGameRecord, saveAlgorithmPerformance, endGame } from '../../../db.js';
import logger from '../../../utils/logger.js';

/**
 * Create a new TSP game record
 * @param {Object} gameData - Game data object with cities, distances, homeCity
 * @param {string} gameData.playerName - Player name
 * @param {Array<string>} gameData.cities - Array of city names
 * @param {Array<Array<number>>} gameData.distances - Distance matrix
 * @param {string} gameData.homeCity - Home city name
 * @returns {Promise<Object>} Result with game ID
 */
export async function createTSPGame(gameData) {
  try {
    const { cities, distances, homeCity, playerName } = gameData;
    
    // Create general game record
    const gameRecord = {
      gameType: 'tsp',
      playerName: playerName || 'Player',
      settings: {
        cities: cities,
        homeCity: homeCity
      },
      status: 'active'
    };
    
    const result = createGameRecord(gameRecord);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to create game record');
    }
    
    const gameId = result.gameId;
    
    // Store game-specific data in the TSP table
    execute(`
      INSERT INTO tsp (
        game_id, 
        cities, 
        distances, 
        home_city
      ) VALUES (?, ?, ?, ?)
    `, [
      gameId,
      JSON.stringify(cities),
      JSON.stringify(distances),
      homeCity
    ]);
    
    return {
      success: true,
      gameId,
      message: 'TSP game created successfully'
    };
  } catch (error) {
    logger.error('Error creating TSP game:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Save TSP algorithm performance
 * @param {number} gameId - Game ID
 * @param {string} algorithmName - Algorithm name
 * @param {number} executionTime - Execution time in ms
 * @param {Object} result - Algorithm result
 * @param {boolean} solutionFound - Whether solution was found
 * @returns {Promise<Object>} Result
 */
export async function saveTSPPerformance(gameId, algorithmName, executionTime, result, solutionFound = true) {
  try {
    const perfData = {
      gameId,
      algorithmName,
      executionTime,
      solutionFound,
      gameType: 'tsp',
      details: {
        distance: result.distance,
        path: result.path
      }
    };
    
    const perfResult = saveAlgorithmPerformance(perfData);
    
    if (!perfResult.success) {
      throw new Error(perfResult.error || 'Failed to save algorithm performance');
    }
    
    // Update the TSP table with the algorithm's solution
    execute(`
      UPDATE tsp
      SET algorithm_type = ?,
          path = ?,
          total_distance = ?
      WHERE game_id = ?
    `, [
      algorithmName,
      JSON.stringify(result.path),
      result.distance,
      gameId
    ]);
    
    return {
      success: true,
      message: 'TSP performance saved successfully'
    };
  } catch (error) {
    logger.error('Error saving TSP performance:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * End TSP game
 * @param {number} gameId - Game ID
 * @param {string} status - Game status (completed, abandoned)
 * @param {Object} finalState - Final game state
 * @returns {Promise<Object>} Result
 */
export async function endTSPGame(gameId, status = 'completed', finalState = {}) {
  try {
    const { path, totalDistance, isValid } = finalState;
    
    const result = endGame({
      gameId,
      status: status || 'completed'
    });
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to end game');
    }
    
    // Update the TSP table with final results
    if (path && totalDistance !== undefined) {
      execute(`
        UPDATE tsp
        SET path = ?,
            total_distance = ?
        WHERE game_id = ?
      `, [
        JSON.stringify(path),
        totalDistance,
        gameId
      ]);
    }
    
    return {
      success: true,
      message: 'TSP game ended successfully'
    };
  } catch (error) {
    logger.error('Error ending TSP game:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get TSP game statistics
 * @returns {Promise<Object>} Statistics
 */
export async function getTSPStats() {
  try {
    const games = query(`
      SELECT COUNT(*) as total_games
      FROM games
      WHERE game_type = 'tsp'
    `);
    
    const algorithms = query(`
      SELECT 
        algorithm_name,
        COUNT(*) as uses,
        AVG(execution_time) as avg_time,
        MIN(execution_time) as min_time,
        MAX(execution_time) as max_time
      FROM algorithm_performance
      WHERE game_id IN (
        SELECT id FROM games WHERE game_type = 'tsp'
      )
      GROUP BY algorithm_name
    `);
    
    const solutions = query(`
      SELECT 
        algorithm_type,
        AVG(total_distance) as avg_distance,
        MIN(total_distance) as min_distance,
        MAX(total_distance) as max_distance
      FROM tsp
      WHERE total_distance IS NOT NULL
      GROUP BY algorithm_type
    `);
    
    return {
      success: true,
      stats: {
        games: games[0] || { total_games: 0 },
        algorithms: algorithms || [],
        solutions: solutions || []
      }
    };
  } catch (error) {
    logger.error('Error getting TSP stats:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export default {
  createTSPGame,
  saveTSPPerformance,
  endTSPGame,
  getTSPStats
};
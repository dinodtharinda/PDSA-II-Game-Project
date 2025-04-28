/**
 * Tic Tac Toe API Service
 * Handles database interactions for the Tic Tac Toe game using client-side SQL.js
 */

import { execute, query, createGameRecord, saveAlgorithmPerformance, endGame } from '../../../db.js';
import logger from '../../../utils/logger.js';

/**
 * Create a new Tic Tac Toe game record
 * @param {Object} settings - Game settings
 * @param {number|null} playerId - Player ID (optional)
 * @returns {Promise<Object>} Game record with ID
 */
export async function createTicTacToeGame(settings = {}, playerId = null) {
  try {
    // Create game record
    const gameData = {
      gameType: 'ticTacToe',
      playerId: playerId,
      settings: settings || { boardSize: 5 },
      status: 'active'
    };

    const result = createGameRecord(gameData);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to create game record');
    }

    const gameId = result.gameId;
    
    // Create specific record in tic_tac_toe table
    execute(`
      INSERT INTO tic_tac_toe (
        game_id, 
        board_size,
        moves,
        winner,
        move_count,
        algorithm_type
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [
      gameId,
      settings.boardSize || 5,
      '[]', // Empty moves array as JSON string
      null, // No winner yet
      0,    // No moves yet
      settings.algorithmType || null
    ]);

    return {
      success: true,
      gameId: gameId,
      message: 'Tic Tac Toe game created successfully'
    };
  } catch (error) {
    logger.error('Failed to create Tic Tac Toe game:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Save algorithm performance for a Tic Tac Toe game
 * @param {number} gameId - Game ID
 * @param {string} algorithmName - Algorithm name
 * @param {number} executionTime - Execution time in ms
 * @param {boolean} solutionFound - Whether solution was found
 * @returns {Promise<Object>} Result object
 */
export async function saveTicTacToePerformance(gameId, algorithmName, executionTime, solutionFound = true) {
  try {
    const perfData = {
      gameId,
      algorithmName,
      executionTime,
      solutionFound,
      gameType: 'ticTacToe'
    };

    const result = saveAlgorithmPerformance(perfData);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to save algorithm performance');
    }

    // Update the algorithm_type in the tic_tac_toe table
    execute(`
      UPDATE tic_tac_toe
      SET algorithm_type = ?
      WHERE game_id = ?
    `, [algorithmName, gameId]);

    return {
      success: true,
      performanceId: result.performanceId,
      message: 'Performance data saved successfully'
    };
  } catch (error) {
    logger.error('Failed to save Tic Tac Toe performance:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * End a Tic Tac Toe game
 * @param {number} gameId - Game ID
 * @param {string} status - Game status (completed, abandoned)
 * @param {string} winner - Winner (X, O, draw)
 * @param {Array} moves - Array of moves
 * @param {number} moveCount - Number of moves
 * @returns {Promise<Object>} Result object
 */
export async function endTicTacToeGame(gameId, status, winner, moves, moveCount) {
  try {
    const result = endGame({
      gameId,
      status: status || 'completed'
    });
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to end game');
    }

    // Update the tic_tac_toe record
    execute(`
      UPDATE tic_tac_toe
      SET winner = ?, moves = ?, move_count = ?
      WHERE game_id = ?
    `, [
      winner || null,
      JSON.stringify(moves || []),
      moveCount || 0,
      gameId
    ]);

    return {
      success: true,
      message: 'Tic Tac Toe game ended successfully'
    };
  } catch (error) {
    logger.error('Failed to end Tic Tac Toe game:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get statistics for Tic Tac Toe games
 * @returns {Promise<Object>} Statistics object
 */
export async function getTicTacToeStats() {
  try {
    // Get overall game statistics
    const gamesQuery = query(`
      SELECT 
        COUNT(*) as total_games,
        SUM(CASE WHEN tt.winner = 'X' THEN 1 ELSE 0 END) as player_wins,
        SUM(CASE WHEN tt.winner = 'O' THEN 1 ELSE 0 END) as computer_wins,
        SUM(CASE WHEN tt.winner = 'draw' THEN 1 ELSE 0 END) as draws,
        AVG(g.duration_seconds) as avg_duration
      FROM games g
      JOIN tic_tac_toe tt ON g.id = tt.game_id
      WHERE g.game_type = 'ticTacToe'
    `);

    // Get algorithm performance stats
    const algorithmQuery = query(`
      SELECT 
        algorithm_name,
        COUNT(*) as uses,
        AVG(execution_time) as avg_execution_time,
        MIN(execution_time) as min_execution_time,
        MAX(execution_time) as max_execution_time
      FROM algorithm_performance
      WHERE game_id IN (SELECT id FROM games WHERE game_type = 'ticTacToe')
      GROUP BY algorithm_name
    `);

    return {
      success: true,
      stats: {
        games: gamesQuery[0] || { total_games: 0 },
        algorithms: algorithmQuery || []
      }
    };
  } catch (error) {
    logger.error('Failed to get Tic Tac Toe stats:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export default {
  createTicTacToeGame,
  saveTicTacToePerformance,
  endTicTacToeGame,
  getTicTacToeStats
};
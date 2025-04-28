/**
 * Knights Tour API Service
 * Client-side implementation for SQLite database
 */

import { createGameRecord, saveAlgorithmPerformance, endGame } from '../../../db.js';

/**
 * Create a new Knights Tour game record
 * @param {Object} settings - Game settings
 * @param {Object} settings.startPosition - Starting position (e.g., { row: 0, col: 0 })
 * @param {number} settings.boardSize - Board size, defaults to 8
 * @param {number} [playerId] - Optional player ID
 * @returns {Promise<Object>} Result with game ID
 */
export async function createGameRecord(settings, playerId = null) {
  try {
    // Prepare the start position in the format expected by the database
    let startPosition = settings.startPosition;
    
    // Check if startPosition is an object and convert to string if needed
    if (typeof startPosition === 'object' && startPosition !== null) {
      const { row, col } = startPosition;
      // Convert to algebraic notation (a1, b2, etc.)
      if (typeof row === 'number' && typeof col === 'number') {
        const colLetter = String.fromCharCode('a'.charCodeAt(0) + col);
        const rowNumber = 8 - row; // Chess notation is reverse of array indices
        startPosition = `${colLetter}${rowNumber}`;
      }
    }

    const result = await window.db.createGameRecord({
      gameType: 'knightsTour',
      playerId: playerId,
      settings: {
        startPosition: startPosition,
        boardSize: settings.boardSize || 8
      }
    });
    
    console.log('Created Knights Tour game record:', result);
    return result;
  } catch (error) {
    console.error('Failed to create Knights Tour game record:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Save algorithm performance metrics for Knights Tour
 * @param {Object} data - Performance data
 * @param {number} data.gameId - Game ID
 * @param {string} data.algorithmName - Algorithm name ('backtracking', 'warnsdorff', etc.)
 * @param {number} data.executionTime - Execution time in milliseconds
 * @param {Array} data.solution - Solution path
 * @returns {Promise<Object>} Result object
 */
export async function saveAlgorithmPerformance(data) {
  try {
    const result = await window.db.saveAlgorithmPerformance({
      gameId: data.gameId,
      algorithmName: data.algorithmName,
      executionTime: data.executionTime,
      solutionFound: data.solution && data.solution.length > 0,
      gameType: 'knightsTour',
      moveSequence: data.solution
    });
    
    console.log('Saved Knights Tour algorithm performance:', result);
    return result;
  } catch (error) {
    console.error('Failed to save Knights Tour algorithm performance:', error);
    return { success: false, error: error.message };
  }
}

/**
 * End a Knights Tour game
 * @param {Object} data - End game data
 * @param {number} data.gameId - Game ID
 * @param {boolean} data.completed - Whether the tour was completed successfully
 * @param {Array} data.moveSequence - Final move sequence
 * @returns {Promise<Object>} Result object
 */
export async function endGame(data) {
  try {
    // Update knights_tour table with final move sequence
    if (data.moveSequence) {
      await window.db.execute(
        'UPDATE knights_tour SET move_sequence = ? WHERE game_id = ?',
        [JSON.stringify(data.moveSequence), data.gameId]
      );
    }
    
    // End game record
    const result = await window.db.endGame({
      gameId: data.gameId,
      status: data.completed ? 'completed' : 'abandoned',
    });
    
    console.log('Knights Tour game ended:', result);
    return result;
  } catch (error) {
    console.error('Failed to end Knights Tour game:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get Knights Tour stats
 * @returns {Promise<Object>} Knights Tour statistics
 */
export async function getStats() {
  try {
    const games = await window.db.query(`
      SELECT 
        COUNT(*) as totalGames,
        SUM(CASE WHEN g.status = 'completed' THEN 1 ELSE 0 END) as completedGames,
        AVG(kt.execution_time) as avgExecutionTime
      FROM games g
      JOIN knights_tour kt ON g.id = kt.game_id
      WHERE g.game_type = 'knightsTour'
    `);
    
    const algorithms = await window.db.query(`
      SELECT 
        ap.algorithm_name,
        COUNT(*) as usageCount,
        AVG(ap.execution_time) as avgTime,
        MIN(ap.execution_time) as minTime,
        MAX(ap.execution_time) as maxTime
      FROM algorithm_performance ap
      JOIN games g ON ap.game_id = g.id
      WHERE g.game_type = 'knightsTour'
      GROUP BY ap.algorithm_name
    `);
    
    return {
      success: true,
      stats: {
        totalGames: games[0]?.totalGames || 0,
        completedGames: games[0]?.completedGames || 0,
        avgExecutionTime: games[0]?.avgExecutionTime || 0,
        algorithms
      }
    };
  } catch (error) {
    console.error('Failed to get Knights Tour stats:', error);
    return { success: false, error: error.message };
  }
}

export default {
  createGameRecord,
  saveAlgorithmPerformance,
  endGame,
  getStats
};
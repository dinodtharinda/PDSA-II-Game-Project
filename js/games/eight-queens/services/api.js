/**
 * Eight Queens API Service
 * Client-side implementation for SQLite database
 */

// Only import execute and query, others are accessed via window.db
import { execute, query } from '../../../db.js'; 

/**
 * Create a new Eight Queens game record
 * @param {Object} settings - Game settings
 * @param {number} settings.boardSize - Board size, defaults to 8
 * @param {number} [playerId] - Optional player ID
 * @returns {Promise<Object>} Result with game ID
 */
export async function createGameRecord(settings, playerId = null) {
  try {
    // Use the globally available window.db object
    const result = await window.db.createGameRecord({
      gameType: 'eightQueens',
      playerId: playerId,
      settings: {
        boardSize: settings.boardSize || 8
      }
    });
    
    console.log('Created Eight Queens game record:', result);
    return result;
  } catch (error) {
    console.error('Failed to create Eight Queens game record:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Save algorithm performance metrics for Eight Queens
 * @param {Object} data - Performance data
 * @param {number} data.gameId - Game ID
 * @param {string} data.algorithmName - Algorithm name ('sequential', 'threaded', etc.)
 * @param {number} data.executionTime - Execution time in milliseconds
 * @param {boolean} data.solutionFound - Whether at least one solution was found
 * @param {number} [data.threadCount] - Thread count for threaded algorithms
 * @returns {Promise<Object>} Result object
 */
export async function saveAlgorithmPerformance(data) {
  try {
    // Use the core db functions directly via window.db
    const result = await window.db.saveAlgorithmPerformance({
      gameId: data.gameId,
      algorithmName: data.algorithmName,
      executionTime: data.executionTime,
      solutionFound: data.solutionFound, // Use the provided boolean
      gameType: 'eightQueens',
    });
    
    // Update the eight_queens table with algorithm details
    await execute(
      'UPDATE eight_queens SET algorithm_type = ?, thread_count = ? WHERE game_id = ?',
      [data.algorithmName, data.threadCount || 1, data.gameId]
    );

    console.log('Saved Eight Queens algorithm performance:', result);
    return result;
  } catch (error) {
    console.error('Failed to save Eight Queens algorithm performance:', error);
    return { success: false, error: error.message };
  }
}

/**
 * End an Eight Queens game
 * @param {Object} data - End game data
 * @param {number} data.gameId - Game ID
 * @param {boolean} data.completed - Whether a valid solution was found by the player
 * @param {Array} data.solution - Final queens configuration submitted by the player
 * @returns {Promise<Object>} Result object
 */
export async function endGame(data) {
  try {
    let status = data.completed ? 'completed' : 'abandoned';
    
    // If completed, check if the player's solution is valid and mark it as found by player
    if (data.completed && data.solution) {
      const validation = await validateSolution(data.solution);
      if (validation.valid) {
        await saveSolution(data.solution, true); // Mark as found by player
      } else {
        // If the submitted solution wasn't valid, mark game as abandoned
        status = 'abandoned'; 
      }
    }
    
    // End game record using the core db function via window.db
    const result = await window.db.endGame({
      gameId: data.gameId,
      status: status,
    });
    
    console.log('Eight Queens game ended:', result);
    return result;
  } catch (error) {
    console.error('Failed to end Eight Queens game:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Save a unique Eight Queens solution to the database
 * @param {Array} solution - Array of queen positions {row, col}
 * @param {boolean} [foundByPlayer=false] - Flag if found by a player submission
 * @returns {Promise<Object>} Result object
 */
export async function saveSolution(solution, foundByPlayer = false) {
  try {
    const solutionString = JSON.stringify(solution.sort((a, b) => a.col - b.col)); // Ensure consistent order
    
    // Try to insert, ignore if it already exists (UNIQUE constraint)
    await execute(
      'INSERT OR IGNORE INTO eight_queens_solutions (solution, found_by_player, first_found_at) VALUES (?, ?, datetime("now"))',
      [solutionString, foundByPlayer ? 1 : 0]
    );
    
    // If found by player, update the flag even if the solution already existed
    if (foundByPlayer) {
      await execute(
        'UPDATE eight_queens_solutions SET found_by_player = 1 WHERE solution = ?',
        [solutionString]
      );
    }
    
    return { success: true };
  } catch (error) {
    console.error('Failed to save Eight Queens solution:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Check if a solution has already been found
 * @param {Array} solution - Array of queen positions {row, col}
 * @returns {Promise<Object>} Result object with boolean `found` and `foundByPlayer` status
 */
export async function isSolutionAlreadyFound(solution) {
  try {
    const solutionString = JSON.stringify(solution.sort((a, b) => a.col - b.col)); // Ensure consistent order
    const result = await query(
      'SELECT found_by_player FROM eight_queens_solutions WHERE solution = ?',
      [solutionString]
    );
    
    const found = result.length > 0;
    const foundByPlayer = found ? !!result[0].found_by_player : false;
    
    return { success: true, found, foundByPlayer };
  } catch (error) {
    console.error('Failed to check if solution exists:', error);
    return { success: false, error: error.message, found: false, foundByPlayer: false };
  }
}

/**
 * Validate a queen arrangement
 * @param {Array} queens - Array of queen positions, where each position is {row, col}
 * @returns {Object} Validation result with threats detected
 */
export async function validateSolution(queens) {
  try {
    // Check if we have exactly 8 queens
    if (!queens || queens.length !== 8) {
      return { 
        valid: false, 
        message: `Expected 8 queens, found ${queens?.length || 0}`,
        threats: [] 
      };
    }
    
    const threats = [];
    
    // Check for row, column, and diagonal conflicts
    for (let i = 0; i < queens.length; i++) {
      for (let j = i + 1; j < queens.length; j++) {
        const queen1 = queens[i];
        const queen2 = queens[j];
        
        // Check if queens are in the same row
        if (queen1.row === queen2.row) {
          threats.push({
            type: 'row',
            queens: [i, j]
          });
        }
        
        // Check if queens are in the same column
        if (queen1.col === queen2.col) {
          threats.push({
            type: 'column',
            queens: [i, j]
          });
        }
        
        // Check if queens are in the same diagonal
        if (Math.abs(queen1.row - queen2.row) === Math.abs(queen1.col - queen2.col)) {
          threats.push({
            type: 'diagonal',
            queens: [i, j]
          });
        }
      }
    }
    
    return {
      valid: threats.length === 0,
      message: threats.length === 0 ? 'Valid solution' : 'Queens are threatening each other',
      threats
    };
  } catch (error) {
    console.error('Failed to validate Eight Queens solution:', error);
    return { 
      valid: false, 
      error: error.message,
      threats: []
    };
  }
}

/**
 * Get Eight Queens stats
 * @returns {Promise<Object>} Eight Queens statistics
 */
export async function getStats() {
  try {
    const games = await query(`
      SELECT 
        COUNT(DISTINCT g.id) as totalGames,
        SUM(CASE WHEN g.status = 'completed' THEN 1 ELSE 0 END) as completedGames
      FROM games g
      LEFT JOIN eight_queens eq ON g.id = eq.game_id
      WHERE g.game_type = 'eightQueens'
    `);
    
    const algorithms = await query(`
      SELECT 
        ap.algorithm_name,
        COUNT(*) as usageCount,
        AVG(ap.execution_time) as avgTime,
        MIN(ap.execution_time) as minTime,
        MAX(ap.execution_time) as maxTime
      FROM algorithm_performance ap
      JOIN games g ON ap.game_id = g.id
      WHERE g.game_type = 'eightQueens'
      GROUP BY ap.algorithm_name
    `);
    
    const solutions = await query(`
      SELECT 
        COUNT(*) as totalSolutionsFound,
        SUM(CASE WHEN found_by_player = 1 THEN 1 ELSE 0 END) as solutionsFoundByPlayer
      FROM eight_queens_solutions
    `);

    // Get performance stats by thread count for threaded algorithm
    const threadStats = await query(`
      SELECT 
        eq.thread_count,
        COUNT(DISTINCT ap.id) as usageCount,
        AVG(ap.execution_time) as avgTime
      FROM algorithm_performance ap
      JOIN games g ON ap.game_id = g.id
      JOIN eight_queens eq ON g.id = eq.game_id
      WHERE g.game_type = 'eightQueens' AND ap.algorithm_name = 'threaded'
      GROUP BY eq.thread_count
      ORDER BY eq.thread_count
    `);
    
    return {
      success: true,
      stats: {
        totalGames: games[0]?.totalGames || 0,
        completedGames: games[0]?.completedGames || 0,
        totalSolutionsFound: solutions[0]?.totalSolutionsFound || 0,
        solutionsFoundByPlayer: solutions[0]?.solutionsFoundByPlayer || 0,
        algorithms,
        threadStats
      }
    };
  } catch (error) {
    console.error('Failed to get Eight Queens stats:', error);
    return { success: false, error: error.message };
  }
}

export default {
  createGameRecord,
  saveAlgorithmPerformance,
  endGame,
  saveSolution, // Added
  isSolutionAlreadyFound, // Added
  validateSolution,
  getStats
};
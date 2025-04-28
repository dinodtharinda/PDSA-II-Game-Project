/**
 * Tower of Hanoi API Service
 * Client-side implementation for SQLite database
 */

import * as db from '../../../db.js';

/**
 * Create a new Tower of Hanoi game record
 * @param {Object} settings - Game settings
 * @param {number} settings.diskCount - Number of disks
 * @param {number} settings.pegCount - Number of pegs (3 or 4)
 * @param {number} [playerId] - Optional player ID
 * @returns {Promise<number>} Game ID
 */
export async function createGameRecord(settings, playerId = null) {
  try {
    // First insert into the games table
    let gameId;
    try {
      const gameInsert = db.execute(
        'INSERT INTO games (game_type, player_id, settings, status, start_time) VALUES (?, ?, ?, ?, datetime("now"))',
        [
          'towerOfHanoi',
          playerId,
          JSON.stringify(settings),
          'active'
        ]
      );
      
      // Get the inserted ID
      const result = db.query('SELECT last_insert_rowid() as id');
      gameId = result[0].id;

      // Then insert into the tower_of_hanoi table
      db.execute(
        'INSERT INTO tower_of_hanoi (game_id, disk_count, peg_count) VALUES (?, ?, ?)',
        [gameId, settings.diskCount || 3, settings.pegCount || 3]
      );
    } catch (e) {
      console.warn("Database insert failed, generating temporary ID:", e);
      // Fallback to a temporary ID if database fails
      gameId = Date.now();
    }
    
    console.log('Created Tower of Hanoi game record:', gameId);
    return gameId;
  } catch (error) {
    console.error('Failed to create Tower of Hanoi game record:', error);
    // Return a fallback ID to allow the game to continue
    return Date.now();
  }
}

/**
 * Save algorithm performance metrics for Tower of Hanoi
 * @param {Object} data - Performance data
 * @param {number} data.gameId - Game ID
 * @param {string} data.algorithmName - Algorithm name ('recursive', 'iterative', 'frameStewart')
 * @param {number} data.executionTime - Execution time in milliseconds
 * @param {Array} data.moveSequence - Solution path
 * @returns {Promise<Object>} Result object
 */
export async function saveAlgorithmPerformance(data) {
  try {
    // Check if gameId exists in games table
    let exists = false;
    try {
      const result = db.query('SELECT id FROM games WHERE id = ?', [data.gameId]);
      exists = result && result.length > 0;
    } catch (e) {
      console.warn("Failed to check game existence:", e);
    }
    
    // Insert algorithm performance record
    try {
      if (exists) {
        // Insert into algorithm_performance table
        db.execute(
          'INSERT INTO algorithm_performance (game_id, algorithm_name, execution_time, solution_found) VALUES (?, ?, ?, ?)',
          [data.gameId, data.algorithmName, data.executionTime, data.moveSequence && data.moveSequence.length > 0 ? 1 : 0]
        );
      }
    } catch (e) {
      console.warn("Failed to save algorithm performance:", e);
    }
    
    console.log('Saved Tower of Hanoi algorithm performance:', {
      gameId: data.gameId,
      algorithm: data.algorithmName,
      time: data.executionTime
    });
    
    return { success: true };
  } catch (error) {
    console.error('Failed to save Tower of Hanoi algorithm performance:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Save a correct solution from a player
 * @param {Object} data - Solution data
 * @param {number} data.gameId - Game ID
 * @param {string} data.playerName - Player's name
 * @param {Array} data.moveSequence - Sequence of moves
 * @param {number} data.moveCount - Number of moves
 * @returns {Promise<Object>} Result object
 */
export async function saveCorrectSolution(data) {
  try {
    // First save the player name (create or get ID)
    let playerId = null;
    try {
      const playerResult = await db.query(
        "SELECT id FROM players WHERE username = ?", 
        [data.playerName]
      );
      
      if (playerResult && playerResult.length > 0) {
        playerId = playerResult[0].id;
      } else {
        const insertResult = await db.execute(
          "INSERT INTO players (username, email, created_at) VALUES (?, ?, datetime('now'))",
          [data.playerName, `${data.playerName.toLowerCase().replace(/\s+/g, '.')}@example.com`]
        );
        playerId = insertResult.lastInsertRowid;
      }
    } catch (e) {
      console.warn("Failed to save or retrieve player record:", e);
    }

    // Update the game record with player ID
    if (playerId) {
      await db.execute(
        "UPDATE games SET player_id = ? WHERE id = ?",
        [playerId, data.gameId]
      );
    }

    // Update the tower_of_hanoi table with move data
    await db.execute(
      'UPDATE tower_of_hanoi SET move_sequence = ?, move_count = ? WHERE game_id = ?',
      [
        JSON.stringify(data.moveSequence), 
        data.moveCount,
        data.gameId
      ]
    );
    
    // End game with completed status
    const result = await db.endGame({
      gameId: data.gameId,
      status: 'completed',
      playerResponse: {
        name: data.playerName,
        moveCount: data.moveCount,
        wasCorrect: true
      }
    });
    
    console.log(`Saved correct solution by ${data.playerName}:`, result);
    return { success: true };
  } catch (error) {
    console.error('Failed to save correct solution:', error);
    return { success: false, error: error.message };
  }
}

/**
 * End a Tower of Hanoi game
 * @param {Object} data - End game data
 * @param {number} data.gameId - Game ID
 * @param {string} data.status - Game status ('completed' or 'abandoned')
 * @param {Object} [data.moveData] - Move data
 * @returns {Promise<Object>} Result object
 */
export async function endGame(data) {
  try {
    // Check if gameId exists in games table
    let exists = false;
    try {
      const result = db.query('SELECT id FROM games WHERE id = ?', [data.gameId]);
      exists = result && result.length > 0;
    } catch (e) {
      console.warn("Failed to check game existence:", e);
    }
    
    if (exists) {
      // Update the end time
      try {
        db.execute(
          'UPDATE games SET status = ?, end_time = datetime("now") WHERE id = ?',
          [data.status || 'completed', data.gameId]
        );
      } catch (e) {
        console.warn("Failed to update game end time:", e);
      }
      
      // If there is move data, update the tower_of_hanoi table
      if (data.moveSequence || data.moveCount) {
        try {
          db.execute(
            'UPDATE tower_of_hanoi SET move_sequence = ?, move_count = ? WHERE game_id = ?',
            [
              data.moveSequence ? JSON.stringify(data.moveSequence) : null, 
              data.moveCount || (data.moveSequence ? data.moveSequence.length : 0), 
              data.gameId
            ]
          );
        } catch (e) {
          console.warn("Failed to update Tower of Hanoi move data:", e);
        }
      }
    }
    
    console.log('Tower of Hanoi game ended:', data);
    return { success: true };
  } catch (error) {
    console.error('Failed to end Tower of Hanoi game:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Validate a Tower of Hanoi move
 * @param {Object} data - Move data
 * @param {number} data.fromPeg - Source peg (0-based)
 * @param {number} data.toPeg - Target peg (0-based)
 * @param {Array<Array<number>>} data.currentState - Current state of pegs
 * @returns {Promise<Object>} Validation result
 */
export async function validateMove(data) {
  try {
    const { fromPeg, toPeg, currentState } = data;
    
    // Check if pegs are valid
    if (fromPeg < 0 || toPeg < 0 || fromPeg >= currentState.length || toPeg >= currentState.length) {
      return { valid: false, message: 'Invalid peg selection' };
    }
    
    // Check if source peg has disks
    if (!currentState[fromPeg].length) {
      return { valid: false, message: 'Source peg has no disks' };
    }
    
    // Get the top disk from source peg
    const diskToMove = currentState[fromPeg][currentState[fromPeg].length - 1];
    
    // Check if target peg is empty or if top disk is larger than disk to move
    if (currentState[toPeg].length > 0) {
      const topDiskOnTarget = currentState[toPeg][currentState[toPeg].length - 1];
      if (diskToMove > topDiskOnTarget) {
        return { 
          valid: false, 
          message: 'Cannot place a larger disk on top of a smaller one' 
        };
      }
    }
    
    return { valid: true, message: 'Move is valid' };
  } catch (error) {
    console.error('Failed to validate Tower of Hanoi move:', error);
    return { valid: false, error: error.message };
  }
}

/**
 * Get Tower of Hanoi stats
 * @returns {Promise<Object>} Tower of Hanoi statistics
 */
export async function getStats() {
  try {
    const games = await db.query(`
      SELECT 
        COUNT(*) as totalGames,
        SUM(CASE WHEN g.status = 'completed' THEN 1 ELSE 0 END) as completedGames,
        AVG(toh.move_count) as avgMoves
      FROM games g
      JOIN tower_of_hanoi toh ON g.id = toh.game_id
      WHERE g.game_type = 'towerOfHanoi'
    `);
    
    const algorithms = await db.query(`
      SELECT 
        ap.algorithm_name,
        COUNT(*) as usageCount,
        AVG(ap.execution_time) as avgTime,
        MIN(ap.execution_time) as minTime,
        MAX(ap.execution_time) as maxTime
      FROM algorithm_performance ap
      JOIN games g ON ap.game_id = g.id
      WHERE g.game_type = 'towerOfHanoi'
      GROUP BY ap.algorithm_name
    `);
    
    const byDiskCount = await db.query(`
      SELECT 
        toh.disk_count,
        COUNT(*) as gameCount,
        AVG(toh.move_count) as avgMoves,
        AVG(ap.execution_time) as avgExecutionTime
      FROM tower_of_hanoi toh
      JOIN games g ON toh.game_id = g.id
      LEFT JOIN algorithm_performance ap ON g.id = ap.game_id
      GROUP BY toh.disk_count
      ORDER BY toh.disk_count
    `);
    
    const byPegCount = await db.query(`
      SELECT 
        toh.peg_count,
        COUNT(*) as gameCount,
        AVG(toh.move_count) as avgMoves
      FROM tower_of_hanoi toh
      JOIN games g ON toh.game_id = g.id
      GROUP BY toh.peg_count
      ORDER BY toh.peg_count
    `);
    
    const topPlayers = await db.query(`
      SELECT 
        p.username,
        COUNT(*) as gamesCompleted,
        MIN(toh.move_count) as bestMoveCount
      FROM games g
      JOIN tower_of_hanoi toh ON g.id = toh.game_id
      JOIN players p ON g.player_id = p.id
      WHERE g.game_type = 'towerOfHanoi' AND g.status = 'completed'
      GROUP BY p.id
      ORDER BY gamesCompleted DESC, bestMoveCount ASC
      LIMIT 5
    `);
    
    return {
      success: true,
      stats: {
        totalGames: games[0]?.totalGames || 0,
        completedGames: games[0]?.completedGames || 0,
        avgMoves: games[0]?.avgMoves || 0,
        algorithms,
        byDiskCount,
        byPegCount,
        topPlayers
      }
    };
  } catch (error) {
    console.error('Failed to get Tower of Hanoi stats:', error);
    return { success: false, error: error.message };
  }
}

export default {
  createGameRecord,
  saveAlgorithmPerformance,
  saveCorrectSolution,
  endGame,
  validateMove,
  getStats
};
/**
 * Stats Controller
 * Handles all statistics-related operations
 */
import logger from '../utils/logger.js';
import { getSequelize } from '../config/db.js';
import { getAlgorithmStats } from '../utils/performanceTracker.js';

// Get overview statistics
export const getOverviewStats = async (req, res, next) => {
  try {
    const sequelize = await getSequelize();
    
    // Get total games and game type distribution
    const [gameStats] = await sequelize.query(`
      SELECT 
        COUNT(*) as totalGames,
        SUM(CASE WHEN game_type = 'ticTacToe' THEN 1 ELSE 0 END) as ticTacToe,
        SUM(CASE WHEN game_type = 'tsp' THEN 1 ELSE 0 END) as tsp,
        SUM(CASE WHEN game_type = 'towerOfHanoi' THEN 1 ELSE 0 END) as towerOfHanoi,
        SUM(CASE WHEN game_type = 'eightQueens' THEN 1 ELSE 0 END) as eightQueens,
        SUM(CASE WHEN game_type = 'knightsTour' THEN 1 ELSE 0 END) as knightsTour
      FROM games
    `);
    
    // Get total players
    const [playerStats] = await sequelize.query(`
      SELECT COUNT(*) as totalPlayers FROM players WHERE role = 'player'
    `);
    
    // Get average execution times by game type
    const [execTimes] = await sequelize.query(`
      SELECT 
        game_type, 
        AVG(execution_time) as avgTime 
      FROM 
        games 
      WHERE 
        execution_time IS NOT NULL 
      GROUP BY 
        game_type
    `);
    
    // Format the response
    const avgTimesByGame = {};
    execTimes.forEach(row => {
      avgTimesByGame[row.game_type] = parseFloat(row.avgTime).toFixed(3);
    });
    
    const stats = {
      totalGames: parseInt(gameStats.totalGames || 0),
      totalPlayers: parseInt(playerStats.totalPlayers || 0),
      gamesPerType: {
        ticTacToe: parseInt(gameStats.ticTacToe || 0),
        tsp: parseInt(gameStats.tsp || 0),
        towerOfHanoi: parseInt(gameStats.towerOfHanoi || 0),
        eightQueens: parseInt(gameStats.eightQueens || 0),
        knightsTour: parseInt(gameStats.knightsTour || 0)
      },
      averageExecutionTimes: avgTimesByGame
    };
    
    res.json(stats);
  } catch (err) {
    logger.error(`Error getting overview stats: ${err.message}`);
    next(err);
  }
};

// Get player statistics
export const getPlayerStats = async (req, res, next) => {
  try {
    const sequelize = await getSequelize();
    const playerId = req.params.id;
    
    // Get player basic info
    const [playerInfo] = await sequelize.query(`
      SELECT id, username FROM players WHERE id = ?
    `, {
      replacements: [playerId]
    });
    
    if (!playerInfo || playerInfo.length === 0) {
      return res.status(404).json({ error: 'Player not found' });
    }
    
    // Get player game statistics
    const [gameStats] = await sequelize.query(`
      SELECT 
        COUNT(*) as totalGames,
        SUM(CASE WHEN game_type = 'ticTacToe' THEN 1 ELSE 0 END) as ticTacToe,
        SUM(CASE WHEN game_type = 'tsp' THEN 1 ELSE 0 END) as tsp,
        SUM(CASE WHEN game_type = 'towerOfHanoi' THEN 1 ELSE 0 END) as towerOfHanoi,
        SUM(CASE WHEN game_type = 'eightQueens' THEN 1 ELSE 0 END) as eightQueens,
        SUM(CASE WHEN game_type = 'knightsTour' THEN 1 ELSE 0 END) as knightsTour,
        SUM(CASE WHEN solution_found = true THEN 1 ELSE 0 END) as gamesWon,
        AVG(duration_seconds) as avgTimePerGame
      FROM games
      WHERE player_id = ?
    `, {
      replacements: [playerId]
    });
    
    // Calculate win rate
    const totalGames = parseInt(gameStats.totalGames || 0);
    const gamesWon = parseInt(gameStats.gamesWon || 0);
    const winRate = totalGames > 0 ? (gamesWon / totalGames).toFixed(2) : 0;
    
    const stats = {
      player: {
        id: parseInt(playerInfo[0].id),
        name: playerInfo[0].username,
      },
      games: {
        total: totalGames,
        byType: {
          ticTacToe: parseInt(gameStats.ticTacToe || 0),
          tsp: parseInt(gameStats.tsp || 0),
          towerOfHanoi: parseInt(gameStats.towerOfHanoi || 0),
          eightQueens: parseInt(gameStats.eightQueens || 0),
          knightsTour: parseInt(gameStats.knightsTour || 0)
        },
        winRate: parseFloat(winRate),
        averageTimePerGame: parseFloat(gameStats.avgTimePerGame || 0).toFixed(2)
      }
    };
    
    res.json(stats);
  } catch (err) {
    logger.error(`Error getting player stats: ${err.message}`);
    next(err);
  }
};

// Get game type statistics
export const getGameTypeStats = async (req, res, next) => {
  try {
    const sequelize = await getSequelize();
    const gameType = req.params.gameType;
    
    // Validate game type
    const validGameTypes = ['ticTacToe', 'tsp', 'towerOfHanoi', 'eightQueens', 'knightsTour'];
    if (!validGameTypes.includes(gameType)) {
      return res.status(400).json({ error: 'Invalid game type' });
    }
    
    // Get game type stats
    const [gameStats] = await sequelize.query(`
      SELECT 
        COUNT(*) as totalGames,
        AVG(execution_time) as avgExecTime
      FROM games
      WHERE game_type = ?
    `, {
      replacements: [gameType]
    });
    
    // Get algorithm performance data
    const [algorithms] = await sequelize.query(`
      SELECT 
        p.algorithm_name,
        AVG(p.execution_time) as avgTime
      FROM 
        performances p
      JOIN 
        games g ON p.game_id = g.id
      WHERE 
        g.game_type = ?
      GROUP BY 
        p.algorithm_name
      ORDER BY 
        avgTime ASC
    `, {
      replacements: [gameType]
    });
    
    const stats = {
      gameType,
      totalGames: parseInt(gameStats.totalGames || 0),
      averageExecutionTime: parseFloat(gameStats.avgExecTime || 0).toFixed(3),
      algorithmPerformance: algorithms.map(alg => ({
        algorithm: alg.algorithm_name,
        avgTime: parseFloat(alg.avgTime).toFixed(2)
      }))
    };
    
    res.json(stats);
  } catch (err) {
    logger.error(`Error getting game type stats: ${err.message}`);
    next(err);
  }
};

// Get algorithm statistics
export const getAlgorithmStats = async (req, res, next) => {
  try {
    const gameType = req.params.gameType;
    const algorithm = req.params.algorithm;
    
    // Validate game type
    const validGameTypes = ['ticTacToe', 'tsp', 'towerOfHanoi', 'eightQueens', 'knightsTour'];
    if (!validGameTypes.includes(gameType)) {
      return res.status(400).json({ error: 'Invalid game type' });
    }
    
    const stats = await getAlgorithmStats(gameType, algorithm);
    res.json(stats);
  } catch (err) {
    logger.error(`Error getting algorithm stats: ${err.message}`);
    next(err);
  }
};
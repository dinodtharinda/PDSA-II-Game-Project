import BaseGame from '../BaseGame.js';
import { getSequelize } from '../../config/db.js';
import logger from '../../utils/logger.js';
import { trackAlgorithmPerformance } from '../../utils/performanceTracker.js';

export default class KnightsTour extends BaseGame {
  /**
   * Create a new Knight's Tour game
   * @param {Object} options - Game options
   * @param {number} [options.boardSize=8] - Size of the board
   * @param {Object} [options.startPosition] - Starting position {row, col}
   * @param {number} [options.playerId] - Player ID for database tracking
   */
  constructor(options = {}) {
    super();
    
    this.boardSize = options.boardSize || 8;
    this.playerId = options.playerId || null;
    
    // Set start position randomly if not provided
    if (options.startPosition) {
      this.startPosition = options.startPosition;
    } else {
      this.startPosition = this.generateRandomPosition();
    }
    
    // Initialize game state
    this.currentPosition = { ...this.startPosition };
    this.moveSequence = [{ ...this.startPosition }];
    this.visitedPositions = new Set(this.positionToString(this.startPosition));
    this.gameId = null; // Will be set after database record creation
    
    // Create database record if player ID is provided
    if (this.playerId) {
      this.createGameRecord();
    }
  }
  
  /**
   * Generate a random position on the board
   * @returns {Object} Random position {row, col}
   */
  generateRandomPosition() {
    return {
      row: Math.floor(Math.random() * this.boardSize),
      col: Math.floor(Math.random() * this.boardSize)
    };
  }
  
  /**
   * Create a game record in the database
   * @returns {Promise<void>}
   */
  async createGameRecord() {
    try {
      const db = await getSequelize();
      // Create a new game record
      const [results] = await db.query(`
        INSERT INTO games 
        (game_type, player_id, settings, status, start_time) 
        VALUES 
        (?, ?, ?, 'in_progress', NOW())
      `, {
        replacements: [
          'knightsTour', 
          this.playerId,
          JSON.stringify({
            boardSize: this.boardSize,
            startPosition: this.toAlgebraicNotation(this.startPosition.row, this.startPosition.col)
          })
        ],
        type: db.QueryTypes.INSERT
      });
      
      this.gameId = results;
      logger.info(`Created new Knight's Tour game with ID: ${this.gameId}`);
    } catch (error) {
      logger.error(`Error creating Knight's Tour game record: ${error.message}`);
    }
  }
  
  /**
   * Convert row/column notation to algebraic notation (e.g., e4)
   * @param {number} row - Row index (0-based)
   * @param {number} col - Column index (0-based)
   * @returns {string} Algebraic notation
   */
  toAlgebraicNotation(row, col) {
    const file = String.fromCharCode(97 + col); // 'a' to 'h'
    const rank = this.boardSize - row; // 8 to 1
    return `${file}${rank}`;
  }
  
  /**
   * Convert algebraic notation to row/column
   * @param {string} algebraic - Algebraic notation (e.g., e4)
   * @returns {Object} Position {row, col}
   */
  fromAlgebraicNotation(algebraic) {
    const file = algebraic.charAt(0).toLowerCase();
    const rank = parseInt(algebraic.substring(1));
    
    const col = file.charCodeAt(0) - 97; // 'a' -> 0, 'b' -> 1, etc.
    const row = this.boardSize - rank; // 8 -> 0, 7 -> 1, etc.
    
    return { row, col };
  }
  
  /**
   * Convert position object to string for set storage
   * @param {Object} pos - Position {row, col}
   * @returns {string} String representation
   */
  positionToString(pos) {
    return `${pos.row},${pos.col}`;
  }
  
  /**
   * Make a move to a new position
   * @param {Object} position - New position {row, col}
   * @returns {boolean} Whether the move was valid
   */
  makeMove(position) {
    if (!this.isValidMove(position)) {
      return false;
    }
    
    this.currentPosition = { ...position };
    this.moveSequence.push({ ...position });
    this.visitedPositions.add(this.positionToString(position));
    
    return true;
  }
  
  /**
   * Check if a move is valid
   * @param {Object} position - Position to check {row, col}
   * @returns {boolean} Whether the move is valid
   */
  isValidMove(position) {
    // Check if out of bounds
    if (
      position.row < 0 || position.row >= this.boardSize ||
      position.col < 0 || position.col >= this.boardSize
    ) {
      return false;
    }
    
    // Check if already visited
    if (this.visitedPositions.has(this.positionToString(position))) {
      return false;
    }
    
    // Check if it's a valid knight move (L-shape)
    const rowDiff = Math.abs(position.row - this.currentPosition.row);
    const colDiff = Math.abs(position.col - this.currentPosition.col);
    
    return (
      (rowDiff === 1 && colDiff === 2) ||
      (rowDiff === 2 && colDiff === 1)
    );
  }
  
  /**
   * Check if the tour is complete (all squares visited)
   * @returns {boolean} Whether the tour is complete
   */
  isComplete() {
    return this.visitedPositions.size === this.boardSize * this.boardSize;
  }
  
  /**
   * Get valid moves from current position
   * @returns {Array<Object>} Array of valid moves {row, col}
   */
  getValidMoves() {
    const moves = [];
    const knightMoves = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]
    ];
    
    for (const [rowDiff, colDiff] of knightMoves) {
      const newRow = this.currentPosition.row + rowDiff;
      const newCol = this.currentPosition.col + colDiff;
      const position = { row: newRow, col: newCol };
      
      if (
        newRow >= 0 && newRow < this.boardSize &&
        newCol >= 0 && newCol < this.boardSize &&
        !this.visitedPositions.has(this.positionToString(position))
      ) {
        moves.push(position);
      }
    }
    
    return moves;
  }
  
  /**
   * Solve the Knight's Tour using the specified algorithm
   * @param {string} algorithmName - Algorithm name ('backtracking' or 'warnsdorff')
   * @returns {Promise<Object>} Algorithm result
   */
  async solve(algorithmName) {
    try {
      // Load algorithm dynamically using ES module import
      const algorithm = await import(`./algorithms/${algorithmName}.js`);
      const findKnightsTour = algorithm.default;
      const { savePerformanceMetrics } = algorithm;
      
      // Run the algorithm
      const result = await findKnightsTour({
        startPosition: this.startPosition,
        boardSize: this.boardSize
      });
      
      // Save performance metrics to database
      if (this.gameId) {
        await savePerformanceMetrics(this, algorithmName, result);
      }
      
      return result;
    } catch (error) {
      logger.error(`Error solving Knight's Tour with ${algorithmName}: ${error.message}`);
      return {
        algorithm: algorithmName,
        success: false,
        executionTime: 0,
        solution: [],
        error: error.message
      };
    }
  }
  
  /**
   * Save algorithm solution to database
   * @param {string} algorithmName - Algorithm name
   * @param {Array<Object>} solution - Solution path
   * @param {number} executionTime - Execution time in seconds
   * @returns {Promise<boolean>} Success status
   */
  async saveAlgorithmSolution(algorithmName, solution, executionTime) {
    if (!this.gameId) return false;
    
    try {
      const db = await getSequelize();
      
      // Format solution as string of algebraic notation
      const moveSequence = solution.map(pos => 
        this.toAlgebraicNotation(pos.row, pos.col)
      ).join(',');
      
      // Create Knights Tour specific record
      await db.query(`
        INSERT INTO knights_tour 
        (game_id, start_position, move_sequence, algorithm_type, execution_time)
        VALUES (?, ?, ?, ?, ?)
      `, {
        replacements: [
          this.gameId,
          this.toAlgebraicNotation(this.startPosition.row, this.startPosition.col),
          moveSequence,
          algorithmName,
          executionTime
        ],
        type: db.QueryTypes.INSERT
      });
      
      // Update general game record
      await trackAlgorithmPerformance({
        gameId: this.gameId,
        algorithmName: algorithmName,
        executionTime: executionTime,
        solutionFound: solution.length === (this.boardSize * this.boardSize),
        status: 'completed'
      });
      
      logger.info(`Saved ${algorithmName} solution for game ${this.gameId}`);
      return true;
    } catch (error) {
      logger.error(`Error saving algorithm solution: ${error.message}`);
      return false;
    }
  }
  
  /**
   * End the game and update database record
   * @param {boolean} completed - Whether the tour was completed
   * @returns {Promise<boolean>} Success status
   */
  async endGame(completed = false) {
    if (!this.gameId) return false;
    
    try {
      const db = await getSequelize();
      
      // Format move sequence
      const moveSequence = this.moveSequence.map(pos => 
        this.toAlgebraicNotation(pos.row, pos.col)
      ).join(',');
      
      // Update knights_tour table
      await db.query(`
        INSERT INTO knights_tour 
        (game_id, start_position, move_sequence, algorithm_type, execution_time)
        VALUES (?, ?, ?, 'player', ?)
      `, {
        replacements: [
          this.gameId,
          this.toAlgebraicNotation(this.startPosition.row, this.startPosition.col),
          moveSequence,
          0 // player's execution time is not measured
        ],
        type: db.QueryTypes.INSERT
      });
      
      // Update general game record
      await db.query(`
        UPDATE games
        SET status = ?, end_time = NOW(), duration_seconds = TIMESTAMPDIFF(SECOND, start_time, NOW())
        WHERE id = ?
      `, {
        replacements: [
          completed ? 'completed' : 'abandoned',
          this.gameId
        ],
        type: db.QueryTypes.UPDATE
      });
      
      logger.info(`Game ${this.gameId} ended with status: ${completed ? 'completed' : 'abandoned'}`);
      return true;
    } catch (error) {
      logger.error(`Error ending game: ${error.message}`);
      return false;
    }
  }
}
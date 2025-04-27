import BaseGame from '../BaseGame.js';
import { KnightsTourUI } from './ui/index.js';

// Import API services if they exist, otherwise provide dummy implementations
let apiService = {
  createGameRecord: async () => ({ success: true, gameId: 'local-' + Date.now() }),
  saveAlgorithmPerformance: async () => ({ success: true }),
  endGame: async () => ({ success: true })
};

// Try to import the API services, but don't fail if they're not available
try {
  apiService = await import('./services/api.js');
} catch (e) {
  console.warn('API services not available, using local implementation:', e);
}

export default class KnightsTour extends BaseGame {
  /**
   * Create a new Knight's Tour game
   * @param {Object|number} options - Game options or board size
   * @param {number} [options.boardSize=8] - Size of the board
   * @param {Object} [options.startPosition] - Starting position {row, col}
   * @param {number} [options.playerId] - Player ID for database tracking
   */
  constructor(options = {}) {
    super();
    
    // Handle case where options is just a number (board size)
    if (typeof options === 'number') {
      this.boardSize = options;
      this.playerId = null;
      this.startPosition = null; // Will be randomized in initializeGame
    } else {
      this.boardSize = options.boardSize || 8;
      this.playerId = options.playerId || null;
      this.startPosition = options.startPosition || null;
    }
    
    // Initialize other properties
    this.currentPosition = null;
    this.moveSequence = [];
    this.visitedPositions = new Set();
    this.gameId = null;
    
    // Initialize game with random start position if not provided
    this.initializeGame(this.startPosition);
  }
  
  // Static method to initialize the UI when the page loads
  static init() {
    console.log('Knight\'s Tour init called');
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', KnightsTour.initializeUI);
    } else {
      // DOM already loaded, initialize immediately
      KnightsTour.initializeUI();
    }
  }
  
  static initializeUI() {
    console.log('Knight\'s Tour initializeUI called');
    try {
      const game = new KnightsTour();
      const ui = new KnightsTourUI();
      ui.initialize(game);
      console.log('Knight\'s Tour UI initialized successfully.');
    } catch (error) {
      console.error('Error initializing Knight\'s Tour:', error);
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
   * Create a game record in the database using API service
   * @returns {Promise<void>}
   */
  async createGameRecord() {
    try {
      const response = await apiService.createGameRecord({
        gameType: 'knightsTour',
        playerId: this.playerId,
        settings: {
          boardSize: this.boardSize,
          startPosition: this.toAlgebraicNotation(this.startPosition.row, this.startPosition.col)
        }
      });
      
      if (response.success && response.gameId) {
        this.gameId = response.gameId;
        console.log(`Created new Knight's Tour game with ID: ${this.gameId}`);
      }
    } catch (error) {
      console.error(`Error creating Knight's Tour game record: ${error.message}`);
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
   * @param {number|Object} row - Row index or position object with row and col properties
   * @param {number} [col] - Column index (if row is not an object)
   * @returns {boolean} Whether the move was valid
   */
  makeMove(row, col) {
    // Handle case where first parameter is an object with row/col properties
    let position;
    if (typeof row === 'object' && row !== null) {
      position = row;
    } else {
      position = { row, col };
    }
    
    // Ensure position has valid row and col properties
    if (typeof position.row !== 'number' || typeof position.col !== 'number') {
      console.error('Invalid position:', position);
      return false;
    }
    
    if (!this.isValidMove(position)) {
      console.error('Invalid move to position:', position);
      // Find closest valid move for debugging purposes
      const validMoves = this.getValidMoves();
      console.log('Valid moves were:', validMoves);
      return false;
    }
    
    // Successfully make the move
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
      console.log(`Starting to solve Knight's Tour using ${algorithmName} algorithm`);
      
      // Load algorithm dynamically using ES module import
      const algorithm = await import(`./algorithms/${algorithmName}.js`);
      const findKnightsTour = algorithm.default;
      
      if (!findKnightsTour) {
        throw new Error(`Algorithm ${algorithmName} not found or not properly exported`);
      }
      
      // Run the algorithm
      const result = await findKnightsTour({
        startPosition: this.currentPosition, // Use current position instead of start position
        boardSize: this.boardSize
      });
      
      console.log(`Algorithm ${algorithmName} complete:`, result.success ? 'Success' : 'Failed');
      console.log(`Solution length: ${result.solution?.length || 0}`);
      
      // Save performance metrics to database via API
      if (this.gameId) {
        await apiService.saveAlgorithmPerformance(this.gameId, algorithmName, result);
      }
      
      return result;
    } catch (error) {
      console.error(`Error solving Knight's Tour with ${algorithmName}:`, error);
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
   * End the game and update database record via API
   * @param {boolean} completed - Whether the tour was completed
   * @returns {Promise<boolean>} Success status
   */
  async endGame(completed = false) {
    if (!this.gameId) return false;
    
    try {
      // Format move sequence for API
      const moveSequence = this.moveSequence.map(pos => 
        this.toAlgebraicNotation(pos.row, pos.col)
      ).join(',');
      
      // Use API service to end the game
      const response = await apiService.endGame(this.gameId, completed, moveSequence);
      
      return response.success === true;
    } catch (error) {
      console.error(`Error ending game: ${error.message}`);
      return false;
    }
  }

  /**
   * Reset the game state
   */
  reset() {
    this.moveSequence = [];
    this.visitedPositions = new Set();
    this.currentPosition = null;
    this.gameId = null;
  }

  /**
   * Initialize a new game with optional starting position
   * @param {Object} startPosition - Optional starting position {row, col}
   */
  initializeGame(startPosition = null) {
    // Set start position
    if (startPosition) {
      this.startPosition = startPosition;
    } else {
      this.startPosition = this.generateRandomPosition();
    }
    
    // Initialize game state
    this.currentPosition = { ...this.startPosition };
    this.moveSequence = [{ ...this.startPosition }];
    this.visitedPositions = new Set([this.positionToString(this.startPosition)]);
    
    // Create database record if player ID is provided
    if (this.playerId) {
      this.createGameRecord();
    }
  }
  
  /**
   * Get current game state for UI display
   * @returns {Object} Game state information
   */
  getGameState() {
    // Create representation of the board for UI
    const board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(null));
    
    // Fill in visited positions with move numbers
    this.moveSequence.forEach((pos, index) => {
      board[pos.row][pos.col] = index;
    });
    
    return {
      board,
      boardSize: this.boardSize,
      startPosition: this.startPosition,
      currentPosition: this.currentPosition,
      validMoves: this.getValidMoves(),
      moveCount: this.moveSequence.length - 1, // Subtract 1 because the start position isn't a move
      isGameActive: this.getValidMoves().length > 0
    };
  }
}
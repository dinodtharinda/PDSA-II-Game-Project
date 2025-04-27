/**
 * Tic Tac Toe Game
 * 5x5 Human vs Computer game with two algorithmic approaches
 */

import Timer from '../../utils/timer.js';
import logger from '../../utils/logger.js';
import minimaxAlgorithm from './algorithms/minimax.js';
import mctsAlgorithm from './algorithms/mcts.js';
import * as api from './services/api.js';

export class TicTacToe {
  /**
   * Initialize a new Tic Tac Toe game
   * @param {Object} config - Game configuration
   */
  constructor(config = {}) {
    // Game state
    this.boardSize = config.boardSize || 5;
    this.board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(null));
    this.currentPlayer = 'X'; // X is human, O is computer
    this.gameOver = false;
    this.winner = null;
    this.moves = [];
    this.gameId = null;
    this.playerName = config.playerName || 'Player';
    this.algorithmType = config.algorithmType || 'minimax';
    this.timer = new Timer();

    // UI callbacks
    this.onBoardUpdate = config.onBoardUpdate || (() => {});
    this.onGameOver = config.onGameOver || (() => {});
    this.onAlgorithmPerformance = config.onAlgorithmPerformance || (() => {});
    
    // Initialize game
    this.init();
  }
  
  /**
   * Initialize the game
   */
  async init() {
    try {
      // Create a new game record in the database
      const result = await api.createTicTacToeGame({
        boardSize: this.boardSize,
        algorithmType: this.algorithmType
      });
      
      if (result.success) {
        this.gameId = result.gameId;
        logger.info(`Tic Tac Toe game created with ID: ${this.gameId}`);
      } else {
        logger.error('Failed to create Tic Tac Toe game record:', result.error);
      }
      
      // Trigger initial board update
      this.onBoardUpdate(this.getGameState());
    } catch (error) {
      logger.error('Error initializing game:', error);
    }
  }
  
  /**
   * Make a player move
   * @param {number} row - Row index
   * @param {number} col - Column index
   * @returns {boolean} Whether the move was successful
   */
  makePlayerMove(row, col) {
    // Check if the move is valid
    if (this.gameOver || this.currentPlayer !== 'X' || row < 0 || row >= this.boardSize || col < 0 || col >= this.boardSize || this.board[row][col] !== null) {
      return false;
    }
    
    // Make the move
    this.board[row][col] = 'X';
    this.moves.push({ player: 'X', row, col });
    
    // Check for win or draw
    if (this.checkGameEnd()) {
      return true;
    }
    
    // Switch to computer's turn
    this.currentPlayer = 'O';
    this.onBoardUpdate(this.getGameState());
    
    // Make computer move after a short delay
    setTimeout(() => this.makeComputerMove(), 500);
    
    return true;
  }
  
  /**
   * Make a computer move using the selected algorithm
   */
  async makeComputerMove() {
    if (this.gameOver || this.currentPlayer !== 'O') {
      return;
    }
    
    try {
      this.timer.start();
      
      let move;
      if (this.algorithmType === 'minimax') {
        move = minimaxAlgorithm.findBestMove(this.board);
      } else {
        move = mctsAlgorithm.findBestMove(this.board);
      }
      
      const executionTime = this.timer.stop();
      
      // Log algorithm performance
      logger.info(`Computer move using ${this.algorithmType} algorithm took ${executionTime}ms`);
      
      // Record algorithm performance in database
      await api.saveTicTacToePerformance(
        this.gameId, 
        this.algorithmType, 
        executionTime,
        true
      );
      
      // Notify UI of algorithm performance
      this.onAlgorithmPerformance({
        algorithm: this.algorithmType,
        executionTime,
        move
      });
      
      // Make the move
      if (move && move.row >= 0 && move.col >= 0) {
        this.board[move.row][move.col] = 'O';
        this.moves.push({ player: 'O', row: move.row, col: move.col });
        
        // Check for win or draw
        if (this.checkGameEnd()) {
          return;
        }
        
        // Switch back to player's turn
        this.currentPlayer = 'X';
        this.onBoardUpdate(this.getGameState());
      }
    } catch (error) {
      logger.error('Error making computer move:', error);
      // Switch back to player's turn in case of error
      this.currentPlayer = 'X';
      this.onBoardUpdate(this.getGameState());
    }
  }
  
  /**
   * Check if the game has ended (win or draw)
   * @returns {boolean} Whether the game has ended
   */
  checkGameEnd() {
    const winner = this.checkWinner();
    
    if (winner) {
      this.gameOver = true;
      this.winner = winner;
      this.endGame();
      return true;
    }
    
    if (this.isBoardFull()) {
      this.gameOver = true;
      this.winner = 'draw';
      this.endGame();
      return true;
    }
    
    return false;
  }
  
  /**
   * Check if the board is full
   * @returns {boolean} Whether the board is full
   */
  isBoardFull() {
    for (let i = 0; i < this.boardSize; i++) {
      for (let j = 0; j < this.boardSize; j++) {
        if (this.board[i][j] === null) {
          return false;
        }
      }
    }
    return true;
  }
  
  /**
   * Check if there is a winner
   * @returns {string|null} Winner ('X' or 'O') or null if no winner
   */
  checkWinner() {
    // Check rows for win (4-in-a-row for 5x5 board)
    for (let i = 0; i < this.boardSize; i++) {
      for (let j = 0; j <= this.boardSize - 4; j++) {
        if (this.board[i][j] !== null &&
            this.board[i][j] === this.board[i][j+1] &&
            this.board[i][j] === this.board[i][j+2] &&
            this.board[i][j] === this.board[i][j+3]) {
          return this.board[i][j];
        }
      }
    }
    
    // Check columns for win
    for (let i = 0; i <= this.boardSize - 4; i++) {
      for (let j = 0; j < this.boardSize; j++) {
        if (this.board[i][j] !== null &&
            this.board[i][j] === this.board[i+1][j] &&
            this.board[i][j] === this.board[i+2][j] &&
            this.board[i][j] === this.board[i+3][j]) {
          return this.board[i][j];
        }
      }
    }
    
    // Check diagonals (top-left to bottom-right)
    for (let i = 0; i <= this.boardSize - 4; i++) {
      for (let j = 0; j <= this.boardSize - 4; j++) {
        if (this.board[i][j] !== null &&
            this.board[i][j] === this.board[i+1][j+1] &&
            this.board[i][j] === this.board[i+2][j+2] &&
            this.board[i][j] === this.board[i+3][j+3]) {
          return this.board[i][j];
        }
      }
    }
    
    // Check diagonals (top-right to bottom-left)
    for (let i = 0; i <= this.boardSize - 4; i++) {
      for (let j = this.boardSize - 1; j >= 3; j--) {
        if (this.board[i][j] !== null &&
            this.board[i][j] === this.board[i+1][j-1] &&
            this.board[i][j] === this.board[i+2][j-2] &&
            this.board[i][j] === this.board[i+3][j-3]) {
          return this.board[i][j];
        }
      }
    }
    
    return null;
  }
  
  /**
   * End the game and update database
   */
  async endGame() {
    try {
      await api.endTicTacToeGame(
        this.gameId,
        'completed',
        this.winner,
        this.moves,
        this.moves.length
      );
      
      // Notify UI that game is over
      this.onGameOver({
        winner: this.winner,
        playerName: this.playerName,
        moves: this.moves.length
      });
      
      logger.info(`Game ended. Winner: ${this.winner === 'draw' ? 'Draw' : this.winner}`);
    } catch (error) {
      logger.error('Error ending game:', error);
    }
  }
  
  /**
   * Change the algorithm used for computer moves
   * @param {string} algorithmType - Algorithm type ('minimax' or 'mcts')
   */
  setAlgorithm(algorithmType) {
    if (algorithmType === 'minimax' || algorithmType === 'mcts') {
      this.algorithmType = algorithmType;
    }
  }
  
  /**
   * Get the current game state
   * @returns {Object} Current game state
   */
  getGameState() {
    return {
      board: this.board,
      currentPlayer: this.currentPlayer,
      gameOver: this.gameOver,
      winner: this.winner,
      moves: this.moves,
      algorithmType: this.algorithmType
    };
  }
  
  /**
   * Reset the game
   */
  reset() {
    // Reset game state
    this.board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(null));
    this.currentPlayer = 'X';
    this.gameOver = false;
    this.winner = null;
    this.moves = [];
    
    // Create new game in database
    this.init();
  }
}

// This is the default export that the app loader expects
export default TicTacToe;
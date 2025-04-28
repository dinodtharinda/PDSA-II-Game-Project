/**
 * Tic Tac Toe UI Component
 * Handles rendering and user interaction for the 5x5 Tic Tac Toe game
 */

import TicTacToe from '../game.js';
import logger from '../../../utils/logger.js';
import { getTicTacToeStats } from '../services/api.js';

export default class TicTacToeUI {
  /**
   * Initialize the Tic Tac Toe UI
   * @param {Object} config - UI configuration
   */
  constructor(config = {}) {
    // DOM elements
    this.boardContainer = null;
    this.controlsContainer = null;
    this.statusContainer = null;
    
    // Game instance
    this.game = null;
    
    // UI state
    this.playerName = config.playerName || 'Player';
    this.algorithmType = config.algorithmType || 'minimax';
    this.boardSize = config.boardSize || 5;
    this.cellSize = config.cellSize || 60;
    
    // Performance metrics
    this.performanceData = {
      minimax: [],
      mcts: []
    };

    // Flag to track if game styles have been injected
    this.stylesInjected = false;
  }
  
  /**
   * Initialize the UI - this method is called by the app loader
   * @param {TicTacToe} game - The game instance
   * @param {string} boardElementId - The ID of the board container element
   * @param {string} controlsElementId - The ID of the controls container element
   * @param {string} statusElementId - The ID of the status container element
   * @returns {TicTacToeUI} - The UI instance for chaining
   */
  async initialize(game, boardElementId = 'tic-tac-toe-board', controlsElementId = 'tic-tac-toe-controls', statusElementId = 'tic-tac-toe-status') {
    logger.info('Initializing Tic-Tac-Toe UI');
    
    // Store the game instance
    this.game = game;
    
    // Inject game-specific CSS if not already injected
    if (!this.stylesInjected) {
      this.injectGameStyles();
      this.stylesInjected = true;
    }
    
    // Get DOM elements
    this.boardContainer = document.getElementById(boardElementId);
    this.controlsContainer = document.getElementById(controlsElementId);
    this.statusContainer = document.getElementById(statusElementId);
    
    // Also get the mobile status container if it exists
    this.mobileStatusContainer = document.getElementById('mobile-game-status');
    
    // Verify DOM elements exist
    if (!this.boardContainer) {
      logger.error(`Board element with ID "${boardElementId}" not found in the DOM`);
      throw new Error(`Board element with ID "${boardElementId}" not found`);
    }
    
    if (!this.controlsContainer) {
      logger.error(`Controls element with ID "${controlsElementId}" not found in the DOM`);
      throw new Error(`Controls element with ID "${controlsElementId}" not found`);
    }
    
    if (!this.statusContainer) {
      logger.error(`Status element with ID "${statusElementId}" not found in the DOM`);
      throw new Error(`Status element with ID "${statusElementId}" not found`);
    }
    
    // Create board container with responsive sizing
    this.boardContainer.innerHTML = '';
    this.boardContainer.classList.add('tic-tac-toe-board');
    
    // Calculate board size based on container width
    const containerWidth = this.boardContainer.clientWidth;
    this.cellSize = Math.floor(Math.min(containerWidth / this.boardSize, 80));
    
    // Create player name and algorithm controls
    this.renderControls();
    
    // Initialize status containers
    const statusHTML = `
      <div class="card mb-3">
        <div class="card-body">
          <h5 class="card-title d-flex align-items-center mb-3">
            <i class="fas fa-chess text-primary me-2"></i>Game Status
          </h5>
          <p id="game-message" class="alert alert-info">Game started. Your turn (X).</p>
        </div>
      </div>
      <div class="card mb-3">
        <div class="card-body">
          <h5 class="card-title d-flex align-items-center mb-3">
            <i class="fas fa-microchip text-success me-2"></i>Algorithm Performance
          </h5>
          <div id="algorithm-performance">
            <p class="text-muted text-center">No moves yet.</p>
          </div>
        </div>
      </div>
    `;
    
    // Set status HTML to both desktop and mobile containers
    this.statusContainer.innerHTML = statusHTML;
    
    if (this.mobileStatusContainer) {
      this.mobileStatusContainer.innerHTML = statusHTML;
    }
    
    // Try to load game statistics
    try {
      const stats = await getTicTacToeStats();
      if (stats.success) {
        this.renderStats(stats.stats);
      }
    } catch (error) {
      logger.error('Failed to load game statistics:', error);
    }
    
    // Set up event handlers in the game instance
    if (this.game) {
      this.game.onBoardUpdate = (gameState) => this.updateBoard(gameState);
      this.game.onGameOver = (result) => this.handleGameOver(result);
      this.game.onAlgorithmPerformance = (data) => this.trackAlgorithmPerformance(data);
      this.game.playerName = this.playerName;
    }
    
    // Handle window resize events for responsive board
    window.addEventListener('resize', this.handleResize.bind(this));
    
    // Create initial board
    this.createBoard();
    
    return this;
  }

  /**
   * Inject game-specific CSS styles into the document head
   * This moves the CSS from global games.css to be component-specific
   */
  injectGameStyles() {
    // Create a style element for Tic-Tac-Toe specific styles
    const styleElement = document.createElement('style');
    styleElement.id = 'tic-tac-toe-styles';
    
    // Add Tic-Tac-Toe specific CSS
    styleElement.textContent = `
      /* Tic-Tac-Toe Game Styles */
      .tic-tac-toe-board {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 6px;
        background-color: #333;
        padding: 10px;
        border-radius: 10px;
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
        width: 100%; /* Make it responsive */
        max-width: 500px;
        margin: 0 auto;
        aspect-ratio: 1/1; /* Keep it square */
      }

      .tic-tac-toe-cell {
        background-color: #f8f9fa;
        aspect-ratio: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        border-radius: 8px;
        transition: all 0.2s ease;
        position: relative;
        overflow: hidden;
      }

      .tic-tac-toe-cell:hover:not(.x-mark):not(.o-mark) {
        background-color: #e9ecef;
        transform: scale(0.95);
        box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.1);
      }

      .tic-tac-toe-cell.x-mark {
        background-color: rgba(255, 76, 76, 0.1);
      }

      .tic-tac-toe-cell.o-mark {
        background-color: rgba(29, 127, 255, 0.1);
      }

      .tic-tac-toe-cell.winning-cell {
        animation: winning-cell-pulse 1.5s infinite;
      }

      @keyframes winning-cell-pulse {
        0% { box-shadow: inset 0 0 5px rgba(40, 167, 69, 0.5); }
        50% { box-shadow: inset 0 0 15px rgba(40, 167, 69, 0.8); }
        100% { box-shadow: inset 0 0 5px rgba(40, 167, 69, 0.5); }
      }

      .game-mark {
        font-size: 2rem;
        font-weight: bold;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 0;
        transform: scale(0.5);
        animation: mark-appear 0.3s forwards;
      }

      .x-mark .game-mark {
        color: #ff4c4c;
      }

      .o-mark .game-mark {
        color: #1d7fff;
      }

      @keyframes mark-appear {
        0% {
          opacity: 0;
          transform: scale(0.5);
        }
        100% {
          opacity: 1;
          transform: scale(1);
        }
      }

      /* Game status styling */
      #game-message {
        font-size: 1.2rem;
        font-weight: 500;
        padding: 12px;
        margin-top: 10px;
        border-radius: 8px;
        text-align: center;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }

      #game-message::before {
        content: '';
        position: absolute;
        left: 0;
        bottom: 0;
        height: 4px;
        width: 100%;
        background: linear-gradient(to right, #6c757d, transparent);
      }

      #game-message.text-success {
        background-color: rgba(40, 167, 69, 0.1);
      }

      #game-message.text-success::before {
        background: linear-gradient(to right, #28a745, rgba(40, 167, 69, 0.2));
      }

      #game-message.text-danger {
        background-color: rgba(220, 53, 69, 0.1);
      }

      #game-message.text-danger::before {
        background: linear-gradient(to right, #dc3545, rgba(220, 53, 69, 0.2));
      }

      #game-message.text-warning {
        background-color: rgba(255, 193, 7, 0.1);
      }

      #game-message.text-warning::before {
        background: linear-gradient(to right, #ffc107, rgba(255, 193, 7, 0.2));
      }

      /* Win animations */
      .player-win {
        animation: winner-pulse 2s ease;
      }

      .computer-win {
        animation: loser-pulse 2s ease;
      }

      @keyframes winner-pulse {
        0%, 100% {
          box-shadow: 0 0 0 rgba(40, 167, 69, 0);
        }
        50% {
          box-shadow: 0 0 20px rgba(40, 167, 69, 0.6);
        }
      }

      @keyframes loser-pulse {
        0%, 100% {
          box-shadow: 0 0 0 rgba(220, 53, 69, 0);
        }
        50% {
          box-shadow: 0 0 20px rgba(220, 53, 69, 0.6);
        }
      }

      /* Algorithm performance card styling */
      #algorithm-performance {
        padding: 10px;
        border-radius: 8px;
      }

      #algorithm-performance p {
        margin-bottom: 8px;
      }

      #algorithm-performance ul {
        padding-left: 20px;
      }

      #algorithm-performance li {
        margin-bottom: 5px;
      }

      /* SVG animations for Tic-Tac-Toe marks */
      .mark-svg {
        width: 100%;
        height: 100%;
      }

      .mark-path {
        stroke-dasharray: 100;
        stroke-dashoffset: 100;
        animation: dash 0.5s ease-in-out forwards;
      }

      @keyframes dash {
        to {
          stroke-dashoffset: 0;
        }
      }

      .o-svg circle {
        animation: dash 0.7s ease-in-out forwards, fill-fade 0.5s ease-in-out 0.5s forwards;
      }

      @keyframes fill-fade {
        from {
          fill: rgba(29, 127, 255, 0);
        }
        to {
          fill: rgba(29, 127, 255, 0.1);
        }
      }

      /* Button click animation */
      .btn-click-effect {
        transform: scale(0.95);
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2) !important;
        transition: all 0.2s ease;
      }

      /* Algorithm change alert fade out animation */
      .algorithm-change-alert {
        transition: opacity 0.3s ease, transform 0.3s ease;
      }

      .algorithm-change-alert.fade-out {
        opacity: 0;
        transform: translateY(-10px);
      }

      /* Enhanced responsive styles for Tic-Tac-Toe */
      .tic-tac-toe-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
      }

      .game-controls-card,
      .game-status-card {
        width: 100%;
        transition: all 0.3s ease;
      }

      /* Improved responsive styles */
      @media (max-width: 992px) {
        .tic-tac-toe-board {
          max-width: 450px;
        }
      }

      @media (max-width: 768px) {
        .tic-tac-toe-board {
          width: 100%;
          max-width: 400px;
          gap: 5px;
          padding: 8px;
        }

        .game-mark {
          font-size: 1.8rem;
        }
        
        .mark-svg path,
        .mark-svg circle {
          stroke-width: 10;
        }
        
        .game-controls-card,
        .game-status-card {
          margin-top: 1.5rem;
        }
        
        #game-message {
          font-size: 1.1rem;
          padding: 10px;
        }
      }

      @media (max-width: 576px) {
        .tic-tac-toe-board {
          max-width: 320px;
          gap: 4px;
          padding: 6px;
        }
        
        .game-mark {
          font-size: 1.5rem;
        }
        
        .mark-svg path,
        .mark-svg circle {
          stroke-width: 8;
        }
      }

      @media (max-width: 400px) {
        .tic-tac-toe-board {
          max-width: 280px;
          gap: 3px;
          padding: 5px;
        }
        
        .game-mark {
          font-size: 1.2rem;
        }
        
        .mark-svg path,
        .mark-svg circle {
          stroke-width: 6;
        }
        
        #game-message {
          font-size: 1rem;
          padding: 8px;
        }
      }
    `;
    
    // Append the style element to the document head
    document.head.appendChild(styleElement);
  }
  
  /**
   * Initialize the UI - legacy method, kept for compatibility
   */
  async init() {
    logger.info('Legacy init method called, prefer using initialize() instead');
    
    // If we already have a game instance from initialize(), use it
    if (!this.game) {
      // Initialize game instance
      this.game = new TicTacToe({
        boardSize: this.boardSize,
        playerName: this.playerName,
        algorithmType: this.algorithmType,
        onBoardUpdate: (gameState) => this.updateBoard(gameState),
        onGameOver: (result) => this.handleGameOver(result),
        onAlgorithmPerformance: (data) => this.trackAlgorithmPerformance(data)
      });
    }
  }
  
  /**
   * Render game controls
   */
  renderControls() {
    this.controlsContainer.innerHTML = `
      <div class="card mb-3 border-info">
        <div class="card-body">
          <h5 class="card-title d-flex align-items-center mb-3">
            <i class="fas fa-robot text-info me-2"></i>
            AI Algorithm
          </h5>
          <div class="algorithm-options">
            <div class="form-check mb-2">
              <input class="form-check-input" type="radio" name="algorithm" id="minimax-algorithm" value="minimax" ${this.algorithmType === 'minimax' ? 'checked' : ''}>
              <label class="form-check-label d-flex align-items-center" for="minimax-algorithm">
                <span class="badge bg-primary me-2"><i class="fas fa-brain"></i></span>
                <span>
                  <strong>Minimax</strong>
                  <small class="d-block text-muted">Alpha-Beta Pruning</small>
                </span>
              </label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="radio" name="algorithm" id="mcts-algorithm" value="mcts" ${this.algorithmType === 'mcts' ? 'checked' : ''}>
              <label class="form-check-label d-flex align-items-center" for="mcts-algorithm">
                <span class="badge bg-success me-2"><i class="fas fa-project-diagram"></i></span>
                <span>
                  <strong>Monte Carlo</strong>
                  <small class="d-block text-muted">Tree Search</small>
                </span>
              </label>
            </div>
          </div>
          <small class="algorithm-info mt-2 d-block text-muted">
            <i class="fas fa-info-circle"></i>
            Algorithm changes apply to the next computer move
          </small>
        </div>
      </div>
      
      <div class="card border-success">
        <div class="card-body">
          <h5 class="card-title d-flex align-items-center mb-3">
            <i class="fas fa-gamepad text-success me-2"></i>
            Game Controls
          </h5>
          <button id="new-game-button" class="btn btn-success w-100 d-flex align-items-center justify-content-center">
            <i class="fas fa-redo-alt me-2"></i>
            New Game
          </button>
        </div>
      </div>
    `;
    
    // Add event listeners for algorithm selection
    document.querySelectorAll('input[name="algorithm"]').forEach(input => {
      input.addEventListener('change', (e) => {
        this.algorithmType = e.target.value;
        
        // Add visual feedback
        const feedbackEl = document.createElement('div');
        feedbackEl.className = 'alert alert-info mt-2 algorithm-change-alert';
        feedbackEl.innerHTML = `<i class="fas fa-sync-alt fa-spin me-2"></i> Switching to <strong>${e.target.value === 'minimax' ? 'Minimax' : 'Monte Carlo Tree Search'}</strong> algorithm`;
        
        // Find and remove any existing alert
        const existingAlert = document.querySelector('.algorithm-change-alert');
        if (existingAlert) {
          existingAlert.remove();
        }
        
        // Add the new alert
        const algorithmOptions = document.querySelector('.algorithm-options');
        algorithmOptions.parentNode.insertBefore(feedbackEl, algorithmOptions.nextSibling);
        
        // Remove after a delay
        setTimeout(() => {
          feedbackEl.classList.add('fade-out');
          setTimeout(() => feedbackEl.remove(), 500);
        }, 1500);
        
        if (this.game) {
          this.game.setAlgorithm(this.algorithmType);
        }
      });
    });
    
    // Add event listener for new game button
    document.getElementById('new-game-button').addEventListener('click', () => {
      // Add button click animation
      const button = document.getElementById('new-game-button');
      button.classList.add('btn-click-effect');
      setTimeout(() => button.classList.remove('btn-click-effect'), 300);
      
      this.resetGame();
    });
  }
  
  /**
   * Create the game board
   */
  createBoard() {
    this.boardContainer.innerHTML = '';
    
    for (let i = 0; i < this.boardSize; i++) {
      for (let j = 0; j < this.boardSize; j++) {
        const cell = document.createElement('div');
        cell.classList.add('tic-tac-toe-cell');
        cell.dataset.row = i;
        cell.dataset.col = j;
        cell.style.width = `${this.cellSize}px`;
        cell.style.height = `${this.cellSize}px`;
        
        // Add cell click handler
        cell.addEventListener('click', () => {
          if (this.game) {
            this.game.makePlayerMove(i, j);
          }
        });
        
        this.boardContainer.appendChild(cell);
      }
    }
  }
  
  /**
   * Update the board based on game state
   * @param {Object} gameState - Current game state
   */
  updateBoard(gameState) {
    if (!gameState || !gameState.board) return;
    
    // Create board if it doesn't exist
    if (this.boardContainer.children.length === 0) {
      this.createBoard();
    }
    
    // Remove winning-cell class from all cells first
    for (let i = 0; i < this.boardContainer.children.length; i++) {
      this.boardContainer.children[i].classList.remove('winning-cell');
    }
    
    // Find winning cells if game is over and there's a winner (not a draw)
    let winningCells = [];
    if (gameState.gameOver && gameState.winner && gameState.winner !== 'draw') {
      winningCells = this.findWinningCells(gameState.board);
      
      // If no winning cells were found but we have a winner, try again with a more thorough search
      if (winningCells.length === 0) {
        winningCells = this.findAllPossibleWinningCells(gameState.board, gameState.winner);
      }
    }
    
    // Update each cell
    for (let i = 0; i < gameState.board.length; i++) {
      for (let j = 0; j < gameState.board[i].length; j++) {
        const cellIndex = i * gameState.board.length + j;
        const cell = this.boardContainer.children[cellIndex];
        
        if (cell) {
          // Clear cell
          cell.innerHTML = '';
          cell.classList.remove('x-mark', 'o-mark');
          
          // Add mark if cell has value
          if (gameState.board[i][j] === 'X') {
            cell.classList.add('x-mark');
            this.renderMark(cell, 'X');
          } else if (gameState.board[i][j] === 'O') {
            cell.classList.add('o-mark');
            this.renderMark(cell, 'O');
          }
          
          // Add winning-cell class if this is part of the winning line
          if (winningCells.some(([r, c]) => r === i && c === j)) {
            cell.classList.add('winning-cell');
          }
        }
      }
    }
    
    // Add a prominent game message box above the board if it doesn't exist
    let gameMessageBox = document.querySelector('.game-message-box');
    if (!gameMessageBox) {
      gameMessageBox = document.createElement('div');
      gameMessageBox.className = 'game-message-box mb-3';
      this.boardContainer.parentNode.insertBefore(gameMessageBox, this.boardContainer);
    }
    
    // Update game message with enhanced styling
    if (gameState.gameOver) {
      if (gameState.winner === 'X') {
        gameMessageBox.innerHTML = `
          <div class="alert alert-success text-center p-3 fw-bold">
            <i class="fas fa-trophy me-2"></i> You win! Congratulations!
          </div>
        `;
        gameMessageBox.style.display = 'block';
      } else if (gameState.winner === 'O') {
        gameMessageBox.innerHTML = `
          <div class="alert alert-danger text-center p-3 fw-bold">
            <i class="fas fa-robot me-2"></i> Computer wins! Better luck next time.
          </div>
        `;
        gameMessageBox.style.display = 'block';
      } else {
        gameMessageBox.innerHTML = `
          <div class="alert alert-warning text-center p-3 fw-bold">
            <i class="fas fa-handshake me-2"></i> It's a draw! Well played.
          </div>
        `;
        gameMessageBox.style.display = 'block';
      }
    } else {
      gameMessageBox.innerHTML = `
        <div class="alert alert-info text-center p-3">
          ${gameState.currentPlayer === 'X' ? 
            '<i class="fas fa-user me-2"></i> Your turn (X)' : 
            '<i class="fas fa-cog fa-spin me-2"></i> Computer is thinking... (O)'}
        </div>
      `;
      gameMessageBox.style.display = 'block';
    }
    
    // Also update the original game message element for compatibility
    const messageElement = document.getElementById('game-message');
    if (messageElement) {
      if (gameState.gameOver) {
        if (gameState.winner === 'X') {
          messageElement.textContent = 'Game over. You win!';
          messageElement.className = 'alert alert-success text-success';
        } else if (gameState.winner === 'O') {
          messageElement.textContent = 'Game over. Computer wins!';
          messageElement.className = 'alert alert-danger text-danger';
        } else {
          messageElement.textContent = 'Game over. It\'s a draw!';
          messageElement.className = 'alert alert-warning text-warning';
        }
      } else {
        messageElement.textContent = gameState.currentPlayer === 'X' ? 
          'Your turn (X)' : 
          'Computer is thinking... (O)';
        messageElement.className = 'alert alert-info';
      }
      
      // Also update mobile message if it exists
      if (this.mobileStatusContainer) {
        const mobileMsgElement = this.mobileStatusContainer.querySelector('#game-message');
        if (mobileMsgElement) {
          mobileMsgElement.textContent = messageElement.textContent;
          mobileMsgElement.className = messageElement.className;
        }
      }
    }
  }
  
  /**
   * Find cells that form a winning line
   * @param {Array} board - Game board
   * @returns {Array} Array of winning cell coordinates [row, col]
   */
  findWinningCells(board) {
    const winningCells = [];
    
    // Check rows for win (4-in-a-row for 5x5 board)
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j <= board.length - 4; j++) {
        if (board[i][j] !== null &&
            board[i][j] === board[i][j+1] &&
            board[i][j] === board[i][j+2] &&
            board[i][j] === board[i][j+3]) {
          winningCells.push([i, j], [i, j+1], [i, j+2], [i, j+3]);
          return winningCells; // Return early once we find a winning line
        }
      }
    }
    
    // Check columns for win
    for (let i = 0; i <= board.length - 4; i++) {
      for (let j = 0; j < board.length; j++) {
        if (board[i][j] !== null &&
            board[i][j] === board[i+1][j] &&
            board[i][j] === board[i+2][j] &&
            board[i][j] === board[i+3][j]) {
          winningCells.push([i, j], [i+1, j], [i+2, j], [i+3, j]);
          return winningCells;
        }
      }
    }
    
    // Check diagonals (top-left to bottom-right)
    for (let i = 0; i <= board.length - 4; i++) {
      for (let j = 0; j <= board.length - 4; j++) {
        if (board[i][j] !== null &&
            board[i][j] === board[i+1][j+1] &&
            board[i][j] === board[i+2][j+2] &&
            board[i][j] === board[i+3][j+3]) {
          winningCells.push([i, j], [i+1, j+1], [i+2, j+2], [i+3, j+3]);
          return winningCells;
        }
      }
    }
    
    // Check diagonals (top-right to bottom-left)
    for (let i = 0; i <= board.length - 4; i++) {
      for (let j = board.length - 1; j >= 3; j--) {
        if (board[i][j] !== null &&
            board[i][j] === board[i+1][j-1] &&
            board[i][j] === board[i+2][j-2] &&
            board[i][j] === board[i+3][j-3]) {
          winningCells.push([i, j], [i+1, j-1], [i+2, j-2], [i+3, j-3]);
          return winningCells;
        }
      }
    }
    
    return winningCells;
  }
  
  /**
   * Find all possible winning cells for a specific player, used as a fallback
   * @param {Array} board - Game board
   * @param {string} player - Player mark ('X' or 'O')
   * @returns {Array} Array of winning cell coordinates [row, col]
   */
  findAllPossibleWinningCells(board, player) {
    // If the player has won, we need to find the winning line
    const playerCells = [];
    
    // First, collect all cells owned by the player
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        if (board[i][j] === player) {
          playerCells.push([i, j]);
        }
      }
    }
    
    // Check for 4-in-a-row patterns
    // Horizontal
    for (const [row, col] of playerCells) {
      if (col <= board.length - 4) {
        let isWinningLine = true;
        for (let j = 0; j < 4; j++) {
          if (board[row][col + j] !== player) {
            isWinningLine = false;
            break;
          }
        }
        if (isWinningLine) {
          return [[row, col], [row, col+1], [row, col+2], [row, col+3]];
        }
      }
    }
    
    // Vertical
    for (const [row, col] of playerCells) {
      if (row <= board.length - 4) {
        let isWinningLine = true;
        for (let i = 0; i < 4; i++) {
          if (board[row + i][col] !== player) {
            isWinningLine = false;
            break;
          }
        }
        if (isWinningLine) {
          return [[row, col], [row+1, col], [row+2, col], [row+3, col]];
        }
      }
    }
    
    // Diagonal (top-left to bottom-right)
    for (const [row, col] of playerCells) {
      if (row <= board.length - 4 && col <= board.length - 4) {
        let isWinningLine = true;
        for (let i = 0; i < 4; i++) {
          if (board[row + i][col + i] !== player) {
            isWinningLine = false;
            break;
          }
        }
        if (isWinningLine) {
          return [[row, col], [row+1, col+1], [row+2, col+2], [row+3, col+3]];
        }
      }
    }
    
    // Diagonal (top-right to bottom-left)
    for (const [row, col] of playerCells) {
      if (row <= board.length - 4 && col >= 3) {
        let isWinningLine = true;
        for (let i = 0; i < 4; i++) {
          if (board[row + i][col - i] !== player) {
            isWinningLine = false;
            break;
          }
        }
        if (isWinningLine) {
          return [[row, col], [row+1, col-1], [row+2, col-2], [row+3, col-3]];
        }
      }
    }
    
    // If no winning line is found, just highlight all the player's cells
    return playerCells;
  }
  
  /**
   * Render X or O mark in a cell
   * @param {HTMLElement} cell - Cell element
   * @param {string} mark - Mark to render ('X' or 'O')
   */
  renderMark(cell, mark) {
    const markElement = document.createElement('div');
    markElement.classList.add('game-mark');
    
    if (mark === 'X') {
      // Use Font Awesome for X mark instead of SVG
      markElement.innerHTML = '<i class="fas fa-times" style="color: #ff4c4c; font-size: 2.5rem;"></i>';
    } else {
      // Use Font Awesome for O mark instead of SVG
      markElement.innerHTML = '<i class="fas fa-circle" style="color: #1d7fff; font-size: 2.2rem;"></i>';
    }
    
    cell.appendChild(markElement);
  }
  
  /**
   * Handle game over
   * @param {Object} result - Game result
   */
  handleGameOver(result) {
    const { winner, playerName, moves } = result;
    
    // Update game message
    const messageElement = document.getElementById('game-message');
    if (messageElement) {
      messageElement.classList.remove('text-success', 'text-danger', 'text-warning', 'alert-info');
      
      if (winner === 'X') {
        messageElement.textContent = `Game over. ${playerName} wins in ${moves} moves!`;
        messageElement.className = 'alert alert-success text-success';
        this.boardContainer.classList.add('player-win');
      } else if (winner === 'O') {
        messageElement.textContent = 'Game over. Computer wins!';
        messageElement.className = 'alert alert-danger text-danger';
        this.boardContainer.classList.add('computer-win');
      } else {
        messageElement.textContent = 'Game over. It\'s a draw!';
        messageElement.className = 'alert alert-warning text-warning';
      }
      
      // Update mobile message if it exists
      if (this.mobileStatusContainer) {
        const mobileMsgElement = this.mobileStatusContainer.querySelector('#game-message');
        if (mobileMsgElement) {
          mobileMsgElement.textContent = messageElement.textContent;
          mobileMsgElement.className = messageElement.className;
        }
      }
    }
    
    // Refresh board to ensure winning cells are highlighted
    if (this.game) {
      this.updateBoard(this.game.getGameState());
    }
    
    // Reset animation after delay
    if (winner === 'X' || winner === 'O') {
      setTimeout(() => {
        this.boardContainer.classList.remove('player-win', 'computer-win');
      }, 2000);
    }
  }
  
  /**
   * Track algorithm performance
   * @param {Object} data - Performance data
   */
  trackAlgorithmPerformance(data) {
    const { algorithm, executionTime, move } = data;
    
    // Store performance data
    if (algorithm === 'minimax' || algorithm === 'mcts') {
      this.performanceData[algorithm].push({ executionTime, move });
    }
    
    // Update performance display
    const performanceElement = document.getElementById('algorithm-performance');
    if (performanceElement) {
      // Calculate averages
      const minimaxAvg = this.calculateAverageTime('minimax');
      const mctsAvg = this.calculateAverageTime('mcts');
      
      // Create performance display
      performanceElement.innerHTML = `
        <div class="mt-2">
          <p><strong>Last move (${algorithm}):</strong> ${executionTime.toFixed(2)}ms</p>
          <p><strong>Average times:</strong></p>
          <ul>
            <li>Minimax: ${minimaxAvg.toFixed(2)}ms (${this.performanceData.minimax.length} moves)</li>
            <li>MCTS: ${mctsAvg.toFixed(2)}ms (${this.performanceData.mcts.length} moves)</li>
          </ul>
        </div>
      `;
    }
  }
  
  /**
   * Calculate average execution time for an algorithm
   * @param {string} algorithm - Algorithm type
   * @returns {number} Average execution time
   */
  calculateAverageTime(algorithm) {
    const data = this.performanceData[algorithm];
    if (!data || data.length === 0) return 0;
    
    const sum = data.reduce((total, item) => total + item.executionTime, 0);
    return sum / data.length;
  }
  
  /**
   * Render game statistics
   * @param {Object} stats - Game statistics
   */
  renderStats(stats) {
    const statsElement = document.createElement('div');
    statsElement.classList.add('card', 'mt-3');
    statsElement.innerHTML = `
      <div class="card-body">
        <h5 class="card-title">Game Statistics</h5>
        <p><strong>Total Games:</strong> ${stats.games.total_games || 0}</p>
        <p><strong>Player Wins:</strong> ${stats.games.player_wins || 0}</p>
        <p><strong>Computer Wins:</strong> ${stats.games.computer_wins || 0}</p>
        <p><strong>Draws:</strong> ${stats.games.draws || 0}</p>
        <h6 class="mt-3">Algorithm Performance:</h6>
        <ul>
          ${stats.algorithms.map(alg => `
            <li><strong>${alg.algorithm_name}:</strong> Avg. ${alg.avg_execution_time.toFixed(2)}ms</li>
          `).join('')}
        </ul>
      </div>
    `;
    
    this.statusContainer.appendChild(statsElement);
  }
  
  /**
   * Reset the game
   */
  resetGame() {
    // Clear board animations
    this.boardContainer.classList.remove('player-win', 'computer-win');
    
    // Reset message styling
    const messageElement = document.getElementById('game-message');
    if (messageElement) {
      messageElement.classList.remove('text-success', 'text-danger', 'text-warning');
    }
    
    // Reset game
    if (this.game) {
      this.game.reset();
    }
  }

  /**
   * Handle window resize events
   */
  handleResize() {
    // Only resize if there's a significant change
    const containerWidth = this.boardContainer.clientWidth;
    const newCellSize = Math.floor(Math.min(containerWidth / this.boardSize, 80));
    
    if (Math.abs(newCellSize - this.cellSize) > 2) {
      this.cellSize = newCellSize;
      this.createBoard();
      
      // If game is in progress, update the board with current state
      if (this.game) {
        this.updateBoard(this.game.getGameState());
      }
    }
  }

  /**
   * Update the game message in both desktop and mobile status containers
   * @param {string} message - The message to display
   * @param {string} className - The CSS class for styling
   */
  updateGameMessage(message, className = '') {
    // Update in desktop container
    const desktopMsg = document.getElementById('game-message');
    if (desktopMsg) {
      desktopMsg.textContent = message;
      
      // Clear all previous classes and add new ones
      desktopMsg.className = '';
      desktopMsg.classList.add('alert');
      
      if (className) {
        className.split(' ').forEach(cls => {
          if (cls) desktopMsg.classList.add(cls);
        });
      }
    }
    
    // Update in mobile container if it exists
    if (this.mobileStatusContainer) {
      const mobileMsg = this.mobileStatusContainer.querySelector('#game-message');
      if (mobileMsg) {
        mobileMsg.textContent = message;
        
        // Clear all previous classes and add new ones
        mobileMsg.className = '';
        mobileMsg.classList.add('alert');
        
        if (className) {
          className.split(' ').forEach(cls => {
            if (cls) mobileMsg.classList.add(cls);
          });
        }
      }
    }
  }
  
  /**
   * Update algorithm performance display in both desktop and mobile containers
   * @param {string} html - The HTML content to display
   */
  updatePerformanceDisplay(html) {
    // Update in desktop container
    const desktopPerf = document.getElementById('algorithm-performance');
    if (desktopPerf) {
      desktopPerf.innerHTML = html;
    }
    
    // Update in mobile container if it exists
    if (this.mobileStatusContainer) {
      const mobilePerf = this.mobileStatusContainer.querySelector('#algorithm-performance');
      if (mobilePerf) {
        mobilePerf.innerHTML = html;
      }
    }
  }
}

// Add static init method for easier initialization from the app loader
TicTacToeUI.init = async function() {
  try {
    const TicTacToeGame = (await import('../game.js')).default;
    const gameInstance = new TicTacToeGame();
    const uiInstance = new TicTacToeUI();
    
    // Ensure the DOM is ready before initializing UI components
    if (document.readyState === 'loading') {
      await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
    }
    
    await uiInstance.initialize(gameInstance);
    return uiInstance;
  } catch (error) {
    console.error('Failed to initialize Tic-Tac-Toe:', error);
    throw error;
  }
};
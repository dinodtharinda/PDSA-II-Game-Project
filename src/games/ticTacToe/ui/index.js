/**
 * Tic Tac Toe UI Component
 * Handles rendering and user interaction for the 5×5 game board
 */

import TicTacToe from '../game.js';
import { debounce } from '../../../utils/timer.js';

class TicTacToeUI {
    constructor() {
        this.game = new TicTacToe();
        this.algorithms = null;
        this.selectedAlgorithm = 'minimax'; // Default algorithm
        
        // DOM elements
        this.boardElement = null;
        this.statusElement = null;
        this.resetButtonElement = null;
        
        // Bind event handlers
        this.handleCellClick = this.handleCellClick.bind(this);
        this.handleResetClick = this.handleResetClick.bind(this);

        // Add touch support and performance optimizations
        this.touchStartTime = 0;
        this.touchStartPosition = null;
        this.resizeObserver = null;
        this.renderDebounced = debounce(this.render.bind(this), 100);

        // Load algorithms dynamically
        this.loadAlgorithms();
    }

    /**
     * Dynamically import algorithm modules
     */
    async loadAlgorithms() {
        try {
            const [minimaxModule, mctsModule] = await Promise.all([
                import('../algorithms/minimax.js'),
                import('../algorithms/mcts.js')
            ]);
            
            this.algorithms = {
                minimax: minimaxModule.default,
                mcts: mctsModule.default
            };
            
            console.log('Algorithms loaded successfully');
        } catch (error) {
            console.error('Error loading algorithm modules:', error);
        }
    }

    /**
     * Initialize the UI components
     * @param {string} boardElementId - ID of the board container element
     * @param {string} controlsElementId - ID of the controls container element
     */
    initialize(boardElementId = 'tic-tac-toe-board', controlsElementId = 'tic-tac-toe-controls') {
        // Initialize board container
        this.boardElement = document.getElementById(boardElementId);
        if (!this.boardElement) {
            throw new Error(`Board element with ID "${boardElementId}" not found`);
        }
        
        // Initialize controls container
        const controlsElement = document.getElementById(controlsElementId);
        if (!controlsElement) {
            throw new Error(`Controls element with ID "${controlsElementId}" not found`);
        }
        
        // Create status element
        this.statusElement = document.createElement('div');
        this.statusElement.className = 'game-status';
        controlsElement.appendChild(this.statusElement);
        
        // Create reset button
        this.resetButtonElement = document.createElement('button');
        this.resetButtonElement.textContent = 'New Game';
        this.resetButtonElement.className = 'btn btn-primary';
        this.resetButtonElement.addEventListener('click', this.handleResetClick);
        controlsElement.appendChild(this.resetButtonElement);
        
        // Add resize observer for responsive updates
        this.resizeObserver = new ResizeObserver(() => {
            this.renderDebounced();
        });
        this.resizeObserver.observe(this.boardElement);

        // Add touch event listeners
        this.boardElement.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.boardElement.addEventListener('touchend', this.handleTouchEnd.bind(this));
        
        // Initial render with loading state
        this.showLoading();
        requestAnimationFrame(() => {
            this.render();
            this.hideLoading();
        });
    }

    showLoading() {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading-indicator';
        loadingDiv.textContent = 'Loading game...';
        this.boardElement.appendChild(loadingDiv);
    }

    hideLoading() {
        const loadingDiv = this.boardElement.querySelector('.loading-indicator');
        if (loadingDiv) {
            loadingDiv.remove();
        }
    }

    /**
     * Handle cell click event
     * @param {number} row - Row index
     * @param {number} col - Column index
     */
    handleCellClick(row, col) {
        if (this.game.currentPlayer === 'O' || !this.game.isGameActive) {
            return;
        }

        if (this.game.makeMove(row, col)) {
            this.render();
            
            // If game is still active, make computer move
            if (this.game.isGameActive) {
                setTimeout(() => this.makeComputerMove(), 500);
            }
        }
    }

    handleTouchStart(event) {
        this.touchStartTime = Date.now();
        this.touchStartPosition = {
            x: event.touches[0].clientX,
            y: event.touches[0].clientY
        };
    }

    handleTouchEnd(event) {
        if (!this.touchStartPosition) return;

        const touchEndPosition = {
            x: event.changedTouches[0].clientX,
            y: event.changedTouches[0].clientY
        };

        const touchDuration = Date.now() - this.touchStartTime;
        const touchDistance = Math.hypot(
            touchEndPosition.x - this.touchStartPosition.x,
            touchEndPosition.y - this.touchStartPosition.y
        );

        // Only handle touch if it's a tap (short duration, small distance)
        if (touchDuration < 500 && touchDistance < 10) {
            const cell = event.target.closest('.cell');
            if (cell) {
                const row = Math.floor([...cell.parentElement.children].indexOf(cell) / 5);
                const col = [...cell.parentElement.children].indexOf(cell) % 5;
                this.handleCellClick(row, col);
            }
        }

        this.touchStartPosition = null;
    }

    /**
     * Make computer move using selected algorithm
     */
    async makeComputerMove() {
        if (!this.game.isGameActive) return;

        // Show thinking indicator
        this.statusElement.textContent = `Computer is thinking...`;
        
        // Use requestAnimationFrame and setTimeout to ensure UI updates
        requestAnimationFrame(() => {
            setTimeout(async () => {
                // Ensure algorithms are loaded
                if (!this.algorithms) {
                    await this.loadAlgorithms();
                }

                const board = this.game.getGameState().board;
                let move;

                const startTime = performance.now();
                if (this.selectedAlgorithm === 'minimax') {
                    move = this.algorithms.minimax.findBestMove(board);
                } else {
                    move = this.algorithms.mcts.findBestMove(board);
                }
                const endTime = performance.now();

                this.game.makeMove(move.row, move.col);
                this.render();

                // Show algorithm performance
                const timeSpent = Math.round(endTime - startTime);
                const currentStatus = this.statusElement.textContent;
                this.statusElement.textContent = `${currentStatus} (took ${timeSpent}ms)`;
            }, 100); // Small delay for better UX
        });
    }

    /**
     * Handle reset button click
     */
    handleResetClick() {
        this.game.reset();
        this.render();
    }

    /**
     * Render the game board
     */
    render() {
        // Clear board
        this.boardElement.innerHTML = '';
        
        // Get game state
        const state = this.game.getGameState();
        
        // Create board grid
        const boardGrid = document.createElement('div');
        boardGrid.className = 'tic-tac-toe-grid';
        
        // Create cells
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                if (state.board[i][j]) {
                    cell.classList.add(state.board[i][j]);
                    cell.textContent = state.board[i][j];
                } else {
                    cell.addEventListener('click', () => this.handleCellClick(i, j));
                }
                boardGrid.appendChild(cell);
            }
        }
        
        this.boardElement.appendChild(boardGrid);
        
        // Update status message
        let statusMessage;
        if (state.winner) {
            statusMessage = state.winner === 'draw' 
                ? "Game Over - It's a Draw!" 
                : `Game Over - ${state.winner} Wins!`;
        } else {
            statusMessage = `Current Player: ${state.currentPlayer}`;
        }
        this.statusElement.textContent = statusMessage;

        // Add visual feedback for current player
        if (state.currentPlayer === 'X') {
            boardGrid.classList.add('player-turn');
        } else {
            boardGrid.classList.remove('player-turn');
        }

        // Add loading states for AI moves
        if (state.currentPlayer === 'O' && state.isGameActive) {
            this.boardElement.classList.add('ai-thinking');
        } else {
            this.boardElement.classList.remove('ai-thinking');
        }
    }

    cleanup() {
        // Clean up event listeners and observers
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
        this.boardElement.removeEventListener('touchstart', this.handleTouchStart);
        this.boardElement.removeEventListener('touchend', this.handleTouchEnd);
    }
}

export default TicTacToeUI;
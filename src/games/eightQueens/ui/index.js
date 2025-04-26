/**
 * Eight Queens UI Component
 * Handles rendering and user interaction for the chessboard
 */

import EightQueens from '../game.js';

export class EightQueensUI {
    constructor() {
        this.game = new EightQueens();
        
        // DOM elements
        this.boardElement = null;
        this.statusElement = null;
        this.controlsElement = null;
        this.resetButtonElement = null;
        
        // Bind methods
        this.handleCellClick = this.handleCellClick.bind(this);
        this.handleResetClick = this.handleResetClick.bind(this);
    }

    /**
     * Initialize the UI components
     * @param {string} boardElementId - Board container element ID
     * @param {string} controlsElementId - Controls container element ID
     */
    async initialize(boardElementId = 'queens-board', controlsElementId = 'queens-controls') {
        // Initialize board container
        this.boardElement = document.getElementById(boardElementId);
        if (!this.boardElement) {
            throw new Error(`Board element with ID "${boardElementId}" not found`);
        }

        // Initialize controls container
        this.controlsElement = document.getElementById(controlsElementId);
        if (!this.controlsElement) {
            throw new Error(`Controls element with ID "${controlsElementId}" not found`);
        }

        // Create status element
        this.statusElement = document.createElement('div');
        this.statusElement.className = 'game-status';
        this.controlsElement.appendChild(this.statusElement);

        // Create reset button
        this.resetButtonElement = document.createElement('button');
        this.resetButtonElement.textContent = 'New Puzzle';
        this.resetButtonElement.className = 'btn btn-primary';
        this.resetButtonElement.addEventListener('click', this.handleResetClick);
        this.controlsElement.appendChild(this.resetButtonElement);

        // Initialize game
        await this.game.initialize();
        this.render();
    }

    /**
     * Handle cell click event
     * @param {number} row - Row index
     * @param {number} col - Column index
     */
    handleCellClick(row, col) {
        const position = EightQueens.coordinatesToPosition(row, col);
        const state = this.game.getGameState();
        
        if (state.board[row][col]) {
            // Remove queen if already placed
            if (this.game.removeQueen(position)) {
                this.render();
            }
        } else {
            // Try to place a queen
            if (this.game.placeQueen(position)) {
                this.render();
            }
        }
    }

    /**
     * Handle reset button click
     */
    async handleResetClick() {
        await this.game.initialize();
        this.render();
    }

    /**
     * Render the game board
     */
    render() {
        // Clear board
        this.boardElement.innerHTML = '';
        
        const state = this.game.getGameState();
        
        // Create chessboard
        const board = document.createElement('div');
        board.className = 'chessboard';
        
        // Create cells
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell' + ((row + col) % 2 ? ' dark' : ' light');
                
                // Add position attribute
                const position = EightQueens.coordinatesToPosition(row, col);
                cell.dataset.position = position;
                
                // Add queen if present
                if (state.board[row][col]) {
                    cell.classList.add('queen');
                } else if (this.game.isUnderAttack(position)) {
                    cell.classList.add('attacked');
                }
                
                cell.addEventListener('click', () => this.handleCellClick(row, col));
                board.appendChild(cell);
            }
        }
        
        this.boardElement.appendChild(board);
        
        // Update status
        let statusText = '';
        if (state.isComplete) {
            statusText = 'Puzzle Complete! All queens placed successfully.';
        } else {
            const remainingQueens = 8 - state.queens.length;
            statusText = `Place ${remainingQueens} more queen${remainingQueens !== 1 ? 's' : ''} on the board.`;
        }
        this.statusElement.textContent = statusText;
    }

    /**
     * Clean up event listeners
     */
    cleanup() {
        if (this.resetButtonElement) {
            this.resetButtonElement.removeEventListener('click', this.handleResetClick);
        }
    }
}

export default EightQueensUI;
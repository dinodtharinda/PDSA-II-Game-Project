/**
 * Tic Tac Toe Game Logic
 * Implements a 3×3 grid with intelligent computer moves
 */

const db = require('../../config/db');
const timer = require('../../utils/timer');
const logger = require('../../utils/logger');
const validator = require('../../utils/validator');

class TicTacToe {
    constructor() {
        // Initialize 3x3 board instead of 5x5
        this.board = Array(3).fill().map(() => Array(3).fill(null));
        this.currentPlayer = 'X'; // Player is X, Computer is O
        this.winner = null;
        this.moveCount = 0;
        this.gameId = null;
        this.timer = new timer.Timer();
        this.isGameActive = true;
    }

    /**
     * Make a move on the board
     * @param {number} row - Row index (0-2)
     * @param {number} col - Column index (0-2)
     * @returns {boolean} Whether the move was successful
     */
    makeMove(row, col) {
        // Validate move
        if (!this.isValidMove(row, col)) {
            return false;
        }

        // Execute move
        this.board[row][col] = this.currentPlayer;
        this.moveCount++;

        // Check for win or draw
        if (this.checkWin(row, col)) {
            this.winner = this.currentPlayer;
            this.isGameActive = false;
            this.endGame();
        } else if (this.moveCount === 25) {
            this.winner = 'draw';
            this.isGameActive = false;
            this.endGame();
        } else {
            // Switch player
            this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        }

        return true;
    }

    /**
     * Check if a move is valid
     * @param {number} row - Row index
     * @param {number} col - Column index
     * @returns {boolean} Whether the move is valid
     */
    isValidMove(row, col) {
        return row >= 0 && row < 5 && 
               col >= 0 && col < 5 && 
               this.board[row][col] === null &&
               this.isGameActive;
    }

    /**
     * Check if the last move resulted in a win
     * @param {number} row - Last move row
     * @param {number} col - Last move column
     * @returns {boolean} Whether the game is won
     */
    checkWin(row, col) {
        const directions = [
            [[0, 1], [0, -1]], // Horizontal
            [[1, 0], [-1, 0]], // Vertical
            [[1, 1], [-1, -1]], // Diagonal
            [[1, -1], [-1, 1]] // Anti-diagonal
        ];

        const player = this.board[row][col];

        for (const [dir1, dir2] of directions) {
            let count = 1;

            // Check in first direction
            let r = row + dir1[0];
            let c = col + dir1[1];
            while (r >= 0 && r < 5 && c >= 0 && c < 5 && this.board[r][c] === player) {
                count++;
                r += dir1[0];
                c += dir1[1];
            }

            // Check in opposite direction
            r = row + dir2[0];
            c = col + dir2[1];
            while (r >= 0 && r < 5 && c >= 0 && c < 5 && this.board[r][c] === player) {
                count++;
                r += dir2[0];
                c += dir2[1];
            }

            if (count >= 4) {
                return true;
            }
        }

        return false;
    }

    /**
     * End the game and record statistics
     */
    async endGame() {
        const endTime = this.timer.stop();
        logger.info(`Tic Tac Toe game ended. Winner: ${this.winner}, Moves: ${this.moveCount}, Time: ${endTime}ms`);
        
        try {
            await this.saveGameResults(endTime);
        } catch (error) {
            logger.error(`Error saving game results: ${error.message}`);
        }
    }

    /**
     * Save game results to database
     * @param {number} durationMs - Game duration in milliseconds
     */
    async saveGameResults(durationMs) {
        if (!this.gameId) return;

        try {
            await db.query(
                'UPDATE games SET result = ?, end_time = CURRENT_TIMESTAMP WHERE id = ?',
                [this.winner === 'X' ? 'win' : this.winner === 'O' ? 'loss' : 'draw', this.gameId]
            );
        } catch (error) {
            throw new Error(`Failed to save game results: ${error.message}`);
        }
    }

    /**
     * Get current game state
     * @returns {Object} Game state object
     */
    getGameState() {
        return {
            board: this.board.map(row => [...row]),
            currentPlayer: this.currentPlayer,
            winner: this.winner,
            moveCount: this.moveCount,
            isGameActive: this.isGameActive
        };
    }

    /**
     * Reset the game
     */
    reset() {
        this.board = Array(5).fill().map(() => Array(5).fill(null));
        this.currentPlayer = 'X';
        this.winner = null;
        this.moveCount = 0;
        this.isGameActive = true;
        this.timer.start();
    }
}

module.exports = TicTacToe;
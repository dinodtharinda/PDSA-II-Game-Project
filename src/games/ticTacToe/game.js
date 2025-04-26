/**
 * Tic Tac Toe Game Logic
 * Implements a 5×5 grid with intelligent computer moves
 */

const db = require('../../config/db');
const Timer = require('../../utils/timer');
const logger = require('../../utils/logger');
const validator = require('../../utils/validator');

class TicTacToe {
    constructor() {
        // Initialize 5x5 board
        this.board = Array(5).fill().map(() => Array(5).fill(null));
        this.currentPlayer = 'X'; // X always starts
        this.winner = null;
        this.moveCount = 0;
        this.gameId = null;
        this.timer = new Timer();
        this.timer.start(); // Start timer when game is created
        this.gameOver = false;
        this.isGameActive = true;
    }

    /**
     * Make a move on the board
     * @param {number} row - Row index (0-4)
     * @param {number} col - Column index (0-4)
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
            this.gameOver = true;
            this.isGameActive = false;
            this.endGame();
        } else if (this.moveCount === 25) {
            // Draw case - explicitly set winner to 'draw' for draw
            this.winner = 'draw';  // Changed from null to 'draw'
            this.gameOver = true;
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
               !this.gameOver;
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
        let endTime;
        try {
            endTime = this.timer.stop();
        } catch (error) {
            logger.error(`Error in endGame: ${error.message}`);
            endTime = 0; // Fallback value
        }
        
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
            let result = 'draw';
            if (this.winner === 'X') result = 'win';
            else if (this.winner === 'O') result = 'loss';

            await db.query(
                'UPDATE games SET result = ?, end_time = CURRENT_TIMESTAMP WHERE id = ?',
                [result, this.gameId]
            );
        } catch (error) {
            throw new Error(`Failed to save game results: ${error.message}`);
        }
    }

    /**
     * Get all empty cells on the board
     * @returns {Array<Array<number>>} Array of [row, col] pairs for empty cells
     */
    getEmptyCells() {
        const emptyCells = [];
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 5; col++) {
                if (this.board[row][col] === null) {
                    emptyCells.push([row, col]);
                }
            }
        }
        return emptyCells;
    }

    /**
     * Create a deep copy of the board
     * @returns {Array<Array<string|null>>} Cloned board
     */
    cloneBoard() {
        return this.board.map(row => [...row]);
    }

    /**
     * Get an AI move from the server
     * @param {string} algorithm - Algorithm to use ('minimax' or 'mcts')
     * @returns {Promise<Object>} AI's move as {row, col}
     */
    async getAIMove(algorithm = 'minimax') {
        try {
            const response = await fetch('/api/games/tic-tac-toe/ai-move', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    board: this.board,
                    player: this.currentPlayer,
                    algorithm: algorithm
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Failed to get AI move: ${error.error || 'Server error'}`);
            }

            const data = await response.json();
            
            if (!data.success) {
                throw new Error(`Failed to get AI move: ${data.error || 'Unknown error'}`);
            }

            return data.move;
        } catch (error) {
            logger.error(`Error getting AI move: ${error.message}`);
            throw error;
        }
    }

    /**
     * Make an AI move automatically
     * @param {string} algorithm - Algorithm to use ('minimax' or 'mcts')
     * @returns {Promise<boolean>} Whether the move was successful
     */
    async makeAIMove(algorithm = 'minimax') {
        try {
            const move = await this.getAIMove(algorithm);
            return this.makeMove(move.row, move.col);
        } catch (error) {
            logger.error(`Error making AI move: ${error.message}`);
            return false;
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
            gameOver: this.gameOver,
            winner: this.winner
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
        this.gameOver = false;
        this.isGameActive = true;
        this.timer.start();
    }
}

module.exports = TicTacToe;
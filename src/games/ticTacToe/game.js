/**
 * Tic Tac Toe Game Logic
 * Implements a 5×5 grid with intelligent computer moves
 */

import { getSequelize } from '../../config/db.js';
import Timer from '../../utils/timer.js';
import logger from '../../utils/logger.js';
import validator from '../../utils/validator.js';
import { trackAlgorithmPerformance } from '../../utils/performanceTracker.js';

class TicTacToe {
    constructor(playerId = null) {
        // Initialize 5x5 board
        this.board = Array(5).fill().map(() => Array(5).fill(null));
        this.currentPlayer = 'X'; // X always starts
        this.winner = null;
        this.moveCount = 0;
        this.gameId = null;
        this.playerId = playerId;
        this.timer = new Timer();
        this.timer.start(); // Start timer when game is created
        this.gameOver = false;
        this.isGameActive = true;
        
        // Create database record if player ID is provided
        if (this.playerId) {
            this.createGameRecord();
        }
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
                    'ticTacToe', 
                    this.playerId,
                    JSON.stringify({
                        boardSize: 5
                    })
                ],
                type: db.QueryTypes.INSERT
            });
            
            this.gameId = results;
            logger.info(`Created new Tic Tac Toe game with ID: ${this.gameId}`);
        } catch (error) {
            logger.error(`Error creating Tic Tac Toe game record: ${error.message}`);
        }
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
     * @returns {Promise<number|null>} Game ID if successful, null otherwise
     */
    async saveGameResults(durationMs) {
        if (!this.gameId) {
            // Create a game record if none exists yet
            await this.createGameRecord();
            if (!this.gameId) return null;
        }

        try {
            const db = await getSequelize();
            let result = 'draw';
            if (this.winner === 'X') result = 'win';
            else if (this.winner === 'O') result = 'loss';

            // Update the games table
            await db.query(`
                UPDATE games 
                SET result = ?, 
                    end_time = NOW(), 
                    duration_seconds = ?, 
                    status = 'completed' 
                WHERE id = ?
            `, {
                replacements: [
                    result, 
                    Math.round(durationMs / 1000),
                    this.gameId
                ],
                type: db.QueryTypes.UPDATE
            });
            
            // Create tic_tac_toe specific record
            await db.query(`
                INSERT INTO tic_tac_toe 
                (game_id, algorithm_type, move_time, move_number) 
                VALUES (?, ?, ?, ?)
            `, {
                replacements: [
                    this.gameId,
                    'player', // Algorithm type is 'player' for human games
                    durationMs / 1000, // Convert to seconds
                    this.moveCount
                ],
                type: db.QueryTypes.INSERT
            });
            
            // Track performance metrics
            await trackAlgorithmPerformance({
                gameId: this.gameId,
                algorithmName: 'player',
                executionTime: durationMs / 1000,
                solutionFound: this.winner !== null,
                iterations: this.moveCount,
                parameters: {
                    boardSize: 5,
                    winner: this.winner || 'draw'
                }
            });
            
            logger.info(`Tic Tac Toe game results saved to database with ID: ${this.gameId}`);
            return this.gameId;
        } catch (error) {
            logger.error(`Error saving Tic Tac Toe game results: ${error.message}`);
            return null;
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
            const startTime = Date.now();
            const move = await this.getAIMove(algorithm);
            const endTime = Date.now();
            const executionTime = (endTime - startTime) / 1000;
            
            // Save algorithm performance metrics
            await this.saveAlgorithmPerformance(algorithm, executionTime);
            
            return this.makeMove(move.row, move.col);
        } catch (error) {
            logger.error(`Error making AI move: ${error.message}`);
            return false;
        }
    }
    
    /**
     * Save algorithm performance metrics to database
     * @param {string} algorithm - Algorithm name ('minimax' or 'mcts')
     * @param {number} executionTime - Execution time in seconds
     * @returns {Promise<void>}
     */
    async saveAlgorithmPerformance(algorithm, executionTime) {
        if (!this.gameId) {
            // Create a game record if none exists yet
            await this.createGameRecord();
            if (!this.gameId) return;
        }
        
        try {
            const db = await getSequelize();
            
            // Create tic_tac_toe specific record for algorithm
            await db.query(`
                INSERT INTO tic_tac_toe 
                (game_id, algorithm_type, move_time, move_number) 
                VALUES (?, ?, ?, ?)
            `, {
                replacements: [
                    this.gameId,
                    algorithm,
                    executionTime,
                    this.moveCount
                ],
                type: db.QueryTypes.INSERT
            });
            
            // Track algorithm performance
            await trackAlgorithmPerformance({
                gameId: this.gameId,
                algorithmName: algorithm,
                executionTime: executionTime,
                solutionFound: true,
                iterations: 1, // One move
                parameters: {
                    boardSize: 5,
                    moveNumber: this.moveCount,
                    player: this.currentPlayer
                }
            });
            
            logger.info(`Tic Tac Toe ${algorithm} algorithm performance saved. Execution time: ${executionTime}s`);
        } catch (error) {
            logger.error(`Error saving algorithm performance: ${error.message}`);
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

export default TicTacToe;
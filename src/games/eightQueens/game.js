/**
 * Eight Queens Game Implementation
 * Implements the classic Eight Queens puzzle with solution validation
 */

const db = require('../../config/db');
const timer = require('../../utils/timer');
const logger = require('../../utils/logger');
const validator = require('../../utils/validator');

class EightQueens {
    constructor() {
        this.board = Array(8).fill().map(() => Array(8).fill(false));
        this.queens = [];
        this.gameId = null;
        this.timer = new timer.Timer();
        this.isComplete = false;
    }

    /**
     * Initialize a new game
     */
    async initialize() {
        this.board = Array(8).fill().map(() => Array(8).fill(false));
        this.queens = [];
        this.isComplete = false;
        this.timer.start();

        try {
            const result = await db.query(
                'INSERT INTO games (game_type) VALUES (?) RETURNING id',
                ['eightQueens']
            );
            this.gameId = result.insertId;
        } catch (error) {
            logger.error(`Failed to initialize Eight Queens game: ${error.message}`);
            throw error;
        }
    }

    /**
     * Convert chess notation to board coordinates
     * @param {string} position - Chess position (e.g., "a1")
     * @returns {Object} Row and column indices
     */
    static positionToCoordinates(position) {
        const col = position.charCodeAt(0) - 'a'.charCodeAt(0);
        const row = 8 - parseInt(position[1]);
        return { row, col };
    }

    /**
     * Convert board coordinates to chess notation
     * @param {number} row - Row index
     * @param {number} col - Column index
     * @returns {string} Chess position
     */
    static coordinatesToPosition(row, col) {
        const colLetter = String.fromCharCode('a'.charCodeAt(0) + col);
        const rowNumber = 8 - row;
        return `${colLetter}${rowNumber}`;
    }

    /**
     * Place a queen on the board
     * @param {string} position - Chess position (e.g., "a1")
     * @returns {boolean} Whether the placement was successful
     */
    placeQueen(position) {
        try {
            // Validate the new placement with existing queens
            const newPlacements = [...this.queens, position];
            validator.validateQueensPlacement(newPlacements);

            // Convert position to coordinates
            const { row, col } = EightQueens.positionToCoordinates(position);
            
            // Place the queen
            this.board[row][col] = true;
            this.queens.push(position);

            // Check if puzzle is complete
            if (this.queens.length === 8) {
                this.isComplete = true;
                this.endGame();
            }

            return true;
        } catch (error) {
            logger.error(`Invalid queen placement: ${error.message}`);
            return false;
        }
    }

    /**
     * Remove a queen from the board
     * @param {string} position - Chess position to remove queen from
     * @returns {boolean} Whether the removal was successful
     */
    removeQueen(position) {
        const index = this.queens.indexOf(position);
        if (index === -1) return false;

        const { row, col } = EightQueens.positionToCoordinates(position);
        this.board[row][col] = false;
        this.queens.splice(index, 1);
        this.isComplete = false;
        return true;
    }

    /**
     * Check if a position is under attack
     * @param {string} position - Chess position to check
     * @returns {boolean} Whether the position is under attack
     */
    isUnderAttack(position) {
        const { row, col } = EightQueens.positionToCoordinates(position);
        
        // Check if any existing queen can attack this position
        for (const queenPos of this.queens) {
            const queen = EightQueens.positionToCoordinates(queenPos);
            
            // Same row or column
            if (queen.row === row || queen.col === col) return true;
            
            // Diagonal
            if (Math.abs(queen.row - row) === Math.abs(queen.col - col)) return true;
        }
        
        return false;
    }

    /**
     * End the game and record statistics
     */
    async endGame() {
        const endTime = this.timer.stop();
        logger.info(`Eight Queens puzzle completed in ${endTime}ms`);
        
        try {
            await db.query(
                `INSERT INTO eight_queens 
                (game_id, solution, solution_number, algorithm_type, execution_time, is_identified) 
                VALUES (?, ?, ?, ?, ?, ?)`,
                [this.gameId, this.queens.join(','), 1, 'manual', endTime, true]
            );
        } catch (error) {
            logger.error(`Failed to save Eight Queens game results: ${error.message}`);
        }
    }

    /**
     * Get current game state
     * @returns {Object} Game state object
     */
    getGameState() {
        return {
            board: this.board.map(row => [...row]),
            queens: [...this.queens],
            isComplete: this.isComplete,
            gameId: this.gameId
        };
    }

    /**
     * Reset the game
     */
    reset() {
        this.board = Array(8).fill().map(() => Array(8).fill(false));
        this.queens = [];
        this.isComplete = false;
        this.timer.start();
    }
}

module.exports = EightQueens;
/**
 * Eight Queens Game Implementation
 * Implements the classic Eight Queens puzzle with solution validation
 */

const db = require('../../config/db');
const Timer = require('../../utils/timer');
const logger = require('../../utils/logger');
const validator = require('../../utils/validator');

class EightQueens {
    constructor() {
        this.board = Array(8).fill().map(() => Array(8).fill(false));
        this.queens = [];
        this.gameId = null;
        this.timer = new Timer();
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
     * @param {string|Object} position - Chess position (e.g., "a1") or object {row, col}
     * @returns {Object} Row and column indices
     */
    static positionToCoordinates(position) {
        // Handle if position is already an object with row and col
        if (position && typeof position === 'object' && 'row' in position && 'col' in position) {
            // Create a new object to avoid reference issues
            return { row: position.row, col: position.col };
        }
        
        // Convert chess notation (e.g., "c5") to coordinates
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
     * @param {Object|string} position - Chess position as object {row, col} or string (e.g., "a1")
     * @param {boolean} [force=false] - Force placement even if position is under attack (for testing)
     * @returns {boolean} Whether the placement was successful
     */
    placeQueen(position, force = false) {
        try {
            // Extract row and col from position
            const { row, col } = EightQueens.positionToCoordinates(position);
            
            // Check if any existing queen can attack this position
            if (!force && this.isUnderAttack({ row, col })) {
                return false;
            }
            
            // Place the queen
            this.board[row][col] = true;
            this.queens.push({ row, col });

            // Check if puzzle is complete
            if (this.queens.length === 8) {
                this.isComplete = true;
                // Don't await endGame here as it would change the return value
                // Just trigger it as a side effect
                this.endGame().catch(error => {
                    logger.error(`Error in endGame: ${error.message}`);
                });
            }

            return true;
        } catch (error) {
            logger.error(`Invalid queen placement: ${error.message}`);
            return false;
        }
    }

    /**
     * Remove a queen from the board
     * @param {Object|string} position - Chess position to remove queen from
     * @returns {boolean} Whether the removal was successful
     */
    removeQueen(position) {
        const { row, col } = EightQueens.positionToCoordinates(position);
        
        // Find queen at the position
        const index = this.queens.findIndex(queen => 
            queen.row === row && queen.col === col
        );
        
        if (index === -1) return false;

        this.board[row][col] = false;
        this.queens.splice(index, 1);
        this.isComplete = false;
        return true;
    }

    /**
     * Check if a position is under attack
     * @param {Object|string} position - Chess position to check
     * @returns {boolean} Whether the position is under attack
     */
    isUnderAttack(position) {
        const { row, col } = EightQueens.positionToCoordinates(position);
        
        // Check if any existing queen can attack this position
        for (const queen of this.queens) {
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
        let executionTime;
        try {
            this.timer.stop();
            executionTime = this.timer.getElapsedTimeMs();
        } catch (error) {
            logger.error(`Error in endGame: ${error.message}`);
            executionTime = 0; // Fallback value
        }
        
        logger.info(`Eight Queens puzzle completed in ${executionTime}ms`);
        
        try {
            // Convert queens to string format for database
            const queensStr = this.queens.map(queen => 
                EightQueens.coordinatesToPosition(queen.row, queen.col)
            ).join(',');
            
            await db.query(
                `INSERT INTO eight_queens 
                (game_id, solution, solution_number, algorithm_type, execution_time, is_identified) 
                VALUES (?, ?, ?, ?, ?, ?)`,
                [this.gameId, queensStr, 1, 'manual', executionTime, true]
            );
            
            return { score: 100 };
        } catch (error) {
            logger.error(`Failed to save Eight Queens game results: ${error.message}`);
            return { score: 0 };
        }
    }

    /**
     * Get current game state
     * @returns {Object} Game state object
     */
    getGameState() {
        return {
            board: this.board.map(row => [...row]),
            queens: [...this.queens]
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

    /**
     * Apply a solution to the board
     * @param {Array} solution - Array of positions (can be in format [row indices] or [{row, col}])
     */
    applySolution(solution) {
        this.reset();
        
        if (Array.isArray(solution)) {
            // Handle solution as array of row indices for each column
            if (typeof solution[0] === 'number') {
                for (let col = 0; col < solution.length; col++) {
                    const row = solution[col];
                    this.placeQueen({ row, col });
                }
            } 
            // Handle solution as array of position objects
            else {
                solution.forEach(position => {
                    this.placeQueen(position);
                });
            }
        }
    }

    /**
     * Fetch solutions from API
     * @param {string} algorithm - Algorithm to use ('sequential' or 'threaded')
     * @returns {Promise<Object>} Solutions object
     */
    async getSolutions(algorithm = 'sequential') {
        logger.info(`Fetching Eight Queens solutions with ${algorithm} algorithm`);
        
        // This is a mock implementation for testing
        // In a real implementation, this would call the API
        return {
            solutions: [
                [0, 4, 7, 5, 2, 6, 1, 3],
                [0, 5, 7, 2, 6, 3, 1, 4]
            ],
            count: 2,
            executionTime: 0.001,
            algorithm: algorithm
        };
    }
}

module.exports = EightQueens;
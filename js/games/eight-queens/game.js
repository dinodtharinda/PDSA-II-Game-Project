/**
 * Eight Queens Game Implementation - Client-side implementation
 * Implements the classic Eight Queens puzzle with solution validation
 */

import Timer from '../../utils/timer.js';
import logger from '../../utils/logger.js';

// Use let instead of const for apiService to allow reassignment in catch block
let apiService = null; 

// Try to import the API services, but don't fail if they're not available
try {
  // Use dynamic import to load the service
  apiService = await import('./services/api.js');
} catch (e) {
  console.warn('Eight Queens API services not available, using dummy implementation:', e);
  // Provide dummy implementations if import fails
  apiService = {
    createGameRecord: async () => ({ success: true, gameId: 'local-' + Date.now() }),
    saveAlgorithmPerformance: async () => ({ success: true }),
    endGame: async () => ({ success: true }),
    validateSolution: async () => ({ valid: true, threats: [] }),
    saveSolution: async () => ({ success: true }),
    isSolutionAlreadyFound: async () => ({ success: true, found: false, foundByPlayer: false }),
    getStats: async () => ({ success: true, stats: {} })
  };
}

// Dynamic algorithm imports - Use absolute paths from root
const algorithmModules = {
  sequential: () => import('/js/games/eight-queens/algorithms/sequential.js'), 
  threaded: () => import('/js/games/eight-queens/algorithms/threaded.js')
};

export class EightQueens {
    constructor(playerId = null) {
        this.board = Array(8).fill().map(() => Array(8).fill(false));
        this.queens = [];
        this.gameId = null;
        this.playerId = playerId;
        this.timer = new Timer();
        this.isComplete = false;
        
        // Create game record if player ID is provided
        if (this.playerId) {
            this.createGameRecord();
        }
    }

    /**
     * Create a game record in the database using API service
     * @returns {Promise<void>}
     */
    async createGameRecord() {
        try {
            const response = await apiService.createGameRecord({
                boardSize: 8
            }, this.playerId);
            
            if (response.success && response.gameId) {
                this.gameId = response.gameId;
                console.log(`Created new Eight Queens game with ID: ${this.gameId}`);
            }
        } catch (error) {
            console.error(`Error creating Eight Queens game record: ${error.message}`);
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
     * @returns {Promise<Object>} Result object { success: boolean, message?: string, alreadyFound?: boolean }
     */
    async placeQueen(position, force = false) {
        try {
            const { row, col } = EightQueens.positionToCoordinates(position);

            // Check if any existing queen can attack this position
            if (!force) {
                const isAttacked = this.isUnderAttackLocal({ row, col }); // Use local check
                if (isAttacked) {
                    return { success: false, message: 'Position is under attack' };
                }
            }

            // Place the queen
            this.board[row][col] = true;
            this.queens.push({ row, col });

            let alreadyFound = false;
            // Check if puzzle is complete
            if (this.queens.length === 8) {
                this.isComplete = true;
                const solutionCheck = await apiService.isSolutionAlreadyFound(this.queens);
                alreadyFound = solutionCheck.foundByPlayer; // Check if found *by a player*
                
                // End the game and save the player's solution
                this.endGame().catch(error => {
                    logger.error(`Error in endGame: ${error.message}`);
                });
            }

            return { success: true, alreadyFound };
        } catch (error) {
            logger.error(`Invalid queen placement: ${error.message}`);
            return { success: false, message: error.message };
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
     * Check if a position is under attack locally (without API)
     * @param {Object} position - Position object {row, col}
     * @returns {boolean} Whether the position is under attack by existing queens
     */
    isUnderAttackLocal(position) {
        const { row, col } = position;
        for (const queen of this.queens) {
            // Same row or column
            if (queen.row === row || queen.col === col) return true;
            
            // Diagonal
            if (Math.abs(queen.row - row) === Math.abs(queen.col - col)) return true;
        }
        return false;
    }

    /**
     * Check if a position is under attack - uses local validation
     * @param {Object|string} position - Chess position to check
     * @returns {Promise<boolean>} Whether the position is under attack
     */
    async isUnderAttack(position) {
        // Primarily use local validation for immediate feedback during placement
        const { row, col } = EightQueens.positionToCoordinates(position);
        return this.isUnderAttackLocal({ row, col });
    }

    /**
     * End the game and record statistics
     */
    async endGame() {
        let executionTime = 0; // Initialize executionTime
        try {
            // Only stop the timer if it was actually running
            if (this.timer.isRunning()) { 
                this.timer.stop();
                executionTime = this.timer.getElapsedTimeMs() / 1000;
                logger.info(`Eight Queens puzzle completed manually in ${executionTime}s`);
            } else {
                // If timer wasn't running (e.g., after solver), log completion without time
                logger.info(`Eight Queens puzzle completed.`); 
            }
        } catch (error) {
            logger.error(`Error handling timer: ${error.message}`);
            executionTime = 0; // Fallback value
        }
        
        if (this.gameId) {
            try {
                // Pass the final solution to the API
                const result = await apiService.endGame({
                    gameId: this.gameId,
                    completed: this.isComplete,
                    solution: this.isComplete ? this.queens : null // Only send solution if complete
                });
                
                return { success: true, score: 100, ...result };
            } catch (error) {
                console.error(`Error ending game: ${error.message}`);
                return { success: false, score: 0, error: error.message };
            }
        }
        
        // If no gameId, still save the solution if complete
        if (this.isComplete) {
             await apiService.saveSolution(this.queens, true); // Mark as found by player
        }

        return { success: true, score: 100 };
    }

    /**
     * Get current game state
     * @returns {Object} Game state object
     */
    getGameState() {
        return {
            board: this.board.map(row => [...row]),
            queens: [...this.queens],
            isComplete: this.isComplete
        };
    }

    /**
     * Reset the game
     */
    reset() {
        this.board = Array(8).fill().map(() => Array(8).fill(false));
        this.queens = [];
        this.isComplete = false;
        this.timer.reset();
        
        // Create a new game record
        if (this.playerId) {
            this.createGameRecord();
        }
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
     * Fetch solutions using algorithm modules
     * @param {string} algorithm - Algorithm to use ('sequential' or 'threaded')
     * @param {Object} [options] - Algorithm options
     * @param {number} [options.maxSolutions] - Maximum number of solutions to find (0 for all)
     * @param {number} [options.threads] - Number of threads for threaded algorithm
     * @returns {Promise<Object>} Solutions object
     */
    async getSolutions(algorithm = 'sequential', options = {}) {
        logger.info(`Fetching Eight Queens solutions with ${algorithm} algorithm`);
        
        // Create a game record if not already created and player ID exists
        if (!this.gameId && this.playerId) {
            await this.createGameRecord();
        }
        
        try {
            const solutionTimer = new Timer();
            solutionTimer.start();
            
            const module = await algorithmModules[algorithm]();
            const algorithmFn = module.default || module.solve;
            
            if (typeof algorithmFn !== 'function') {
                throw new Error(`Algorithm function not found for ${algorithm}`);
            }
            
            const algorithmOptions = {
                maxSolutions: options.maxSolutions || 0 // 0 means find all
            };
            
            if (algorithm === 'threaded' && options.threads) {
                algorithmOptions.threads = options.threads;
            }
            
            const solutions = await algorithmFn(algorithmOptions);
            
            solutionTimer.stop();
            const executionTime = solutionTimer.getElapsedTimeMs() / 1000;
            
            logger.info(`Found ${solutions.length} solutions in ${executionTime}s using ${algorithm}`);
            
            // Save algorithm performance
            if (this.gameId) {
                try {
                    await apiService.saveAlgorithmPerformance({
                        gameId: this.gameId,
                        algorithmName: algorithm,
                        executionTime: executionTime,
                        solutionFound: solutions.length > 0,
                        threadCount: options.threads || 1
                    });
                } catch (error) {
                    console.error(`Error saving algorithm performance: ${error.message}`);
                }
            }

            // Save all found solutions to the global solutions table
            // Do this regardless of whether there's a gameId, as solutions are universal
            if (solutions.length > 0) {
                logger.info(`Saving ${solutions.length} found solutions...`);
                // Use Promise.all for potentially faster saving if many solutions
                await Promise.all(solutions.map(sol => apiService.saveSolution(sol, false))); // Mark as NOT found by player
                logger.info('Solutions saved.');
            }
            
            return {
                success: true,
                solutions,
                count: solutions.length,
                executionTime,
                algorithm
            };
        } catch (error) {
            logger.error(`Error getting solutions with ${algorithm} algorithm: ${error.message}`);
            return {
                success: false,
                error: error.message,
                solutions: [],
                count: 0,
                executionTime: 0,
                algorithm
            };
        }
    }
    
    /**
     * Get statistics for Eight Queens games
     * @returns {Promise<Object>} Statistics data
     */
    static async getStats() {
        try {
            return await apiService.getStats();
        } catch (error) {
            console.error(`Error getting Eight Queens stats: ${error.message}`);
            return { success: false, error: error.message };
        }
    }
}

export default EightQueens;
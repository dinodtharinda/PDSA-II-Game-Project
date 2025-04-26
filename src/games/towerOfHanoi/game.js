/**
 * Tower of Hanoi Game Logic
 * 
 * This file contains the core game logic for the Tower of Hanoi puzzle.
 * It supports both 3-peg and 4-peg configurations and random disk numbers.
 */

import Timer from '../../utils/timer.js';
import logger from '../../utils/logger.js';
import { getSequelize } from '../../config/db.js';
import { trackAlgorithmPerformance } from '../../utils/performanceTracker.js';

// Dynamic algorithm imports
const algorithmModules = {
  recursive: () => import('./algorithms/recursive.js'),
  iterative: () => import('./algorithms/iterative.js'),
  frameStewart: () => import('./algorithms/frameStewart.js')
};

export class TowerOfHanoi {
    /**
     * Initialize a new Tower of Hanoi game
     * @param {number} disks - Number of disks (default: random between 5-10)
     * @param {number} pegCount - Number of pegs (3 or 4, default: 3)
     */
    constructor(disks = null, pegCount = 3) {
        this.diskCount = disks || this.getRandomDiskCount();
        this.pegCount = pegCount;
        this.timer = new Timer();
        this.moves = 0;
        this.minMoves = this.calculateMinimumMoves();
        this.selectedAlgorithm = 'recursive';
        this.isGameActive = false;
        this.pegs = [];
        this.moveSequence = [];
        this.reset();
    }

    /**
     * Generate a random disk count between 5 and 10
     */
    getRandomDiskCount() {
        return Math.floor(Math.random() * 6) + 5; // 5-10 disks
    }

    /**
     * Calculate minimum moves required for current configuration
     * @returns {number} Minimum moves required
     */
    calculateMinimumMoves() {
        if (this.pegCount === 3) {
            return Math.pow(2, this.diskCount) - 1;
        } else if (this.pegCount === 4) {
            // Frame-Stewart algorithm approximation
            const k = Math.floor(Math.sqrt(2 * this.diskCount));
            return Math.pow(2, this.diskCount - k) + Math.pow(2, k) - 2;
        }
        return Infinity;
    }

    /**
     * Reset the game with current settings
     */
    reset() {
        this.pegs = Array(this.pegCount).fill().map(() => []);
        for (let i = this.diskCount; i >= 1; i--) {
            this.pegs[0].push(i);
        }
        this.moves = 0;
        this.moveSequence = [];
        this.isGameActive = true;
        this.timer.start();
        logger.info(`Tower of Hanoi game reset with ${this.diskCount} disks and ${this.pegCount} pegs`);
    }

    /**
     * Check if a move is legal
     * @param {number} fromPeg - Source peg index (0-based)
     * @param {number} toPeg - Destination peg index (0-based)
     * @returns {boolean} - Whether the move is valid
     */
    isMoveLegal(fromPeg, toPeg) {
        // Check peg indices
        if (fromPeg < 0 || fromPeg >= this.pegCount || toPeg < 0 || toPeg >= this.pegCount) {
            return false;
        }

        // Check if source peg has disks
        if (this.pegs[fromPeg].length === 0) {
            return false;
        }

        // Check if destination peg is empty or if top disk is larger
        const movingDisk = this.pegs[fromPeg][this.pegs[fromPeg].length - 1];
        return this.pegs[toPeg].length === 0 || 
               this.pegs[toPeg][this.pegs[toPeg].length - 1] > movingDisk;
    }

    /**
     * Make a move
     * @param {number} fromPeg - Source peg index (0-based)
     * @param {number} toPeg - Destination peg index (0-based)
     * @returns {boolean} - Whether the move was successful
     */
    makeMove(fromPeg, toPeg) {
        if (!this.isGameActive || !this.isMoveLegal(fromPeg, toPeg)) {
            return false;
        }

        const disk = this.pegs[fromPeg].pop();
        this.pegs[toPeg].push(disk);
        this.moves++;
        this.moveSequence.push({ from: fromPeg, to: toPeg, disk });

        if (this.isGameWon()) {
            this.endGame();
        }

        return true;
    }

    /**
     * Alias for makeMove - used by the UI
     * @param {number} fromPeg - Source peg index (0-based)
     * @param {number} toPeg - Destination peg index (0-based)
     * @returns {boolean} - Whether the move was successful
     */
    moveDisk(fromPeg, toPeg) {
        return this.makeMove(fromPeg, toPeg);
    }

    /**
     * Check if the game is complete (all disks moved to the last peg)
     * @returns {boolean} - Whether the game is complete
     */
    isGameWon() {
        return this.pegs[this.pegCount - 1].length === this.diskCount;
    }

    /**
     * End the game and record statistics
     */
    endGame() {
        this.isGameActive = false;
        this.timer.stop();
        logger.info(`Tower of Hanoi game completed in ${this.moves} moves (optimal: ${this.minMoves})`);
        this.saveGameResults(this.timer.getElapsedTimeMs());
    }

    /**
     * Save game results to database
     * @param {number} durationMs - Game duration in milliseconds
     */
    async saveGameResults(durationMs) {
        try {
            const sequelize = await getSequelize();
            
            // Create game record
            const [result] = await sequelize.query(
                'INSERT INTO games (game_type, end_time, result) VALUES (?, ?, ?) RETURNING id',
                {
                    replacements: [
                        'towerOfHanoi', 
                        new Date(), 
                        this.moves === this.minMoves ? 'optimal' : 'completed'
                    ],
                    type: sequelize.QueryTypes.INSERT
                }
            );
            
            const gameId = result[0].id;
            
            // Create tower_of_hanoi specific record
            await sequelize.query(
                `INSERT INTO tower_of_hanoi 
                (game_id, disk_count, move_count, move_sequence, algorithm_type, execution_time) 
                VALUES (?, ?, ?, ?, ?, ?)`,
                {
                    replacements: [
                        gameId, 
                        this.diskCount, 
                        this.moves, 
                        JSON.stringify(this.moveSequence),
                        this.selectedAlgorithm,
                        durationMs / 1000
                    ],
                    type: sequelize.QueryTypes.INSERT
                }
            );
            
            // Track performance metrics
            await trackAlgorithmPerformance({
                gameId: gameId,
                algorithmName: 'player',
                executionTime: durationMs / 1000,
                solutionFound: this.isGameWon(),
                iterations: this.moves,
                parameters: {
                    diskCount: this.diskCount,
                    pegCount: this.pegCount
                }
            });
            
            logger.info('Tower of Hanoi game results saved to database');
            return gameId;
        } catch (err) {
            logger.error(`Error saving Tower of Hanoi game results: ${err.message}`);
            return null;
        }
    }

    /**
     * Get current game state
     * @returns {Object} - Game state object
     */
    getGameState() {
        return {
            diskCount: this.diskCount,
            pegCount: this.pegCount,
            pegs: this.pegs.map(peg => [...peg]),
            moveCount: this.moves,
            optimalMoveCount: this.minMoves,
            isGameComplete: this.isGameWon(),
            isGameActive: this.isGameActive,
            selectedAlgorithm: this.selectedAlgorithm
        };
    }
    
    /**
     * Set the algorithm to use for solving the puzzle
     * @param {string} algorithm - Algorithm name ('recursive', 'iterative', 'frameStewart')
     */
    setAlgorithm(algorithm) {
        if (!algorithmModules[algorithm]) {
            throw new Error(`Unknown algorithm: ${algorithm}`);
        }
        
        // Frame-Stewart only works with 4 pegs
        if (algorithm === 'frameStewart' && this.pegCount !== 4) {
            throw new Error('Frame-Stewart algorithm requires 4 pegs');
        }
        
        this.selectedAlgorithm = algorithm;
        logger.info(`Algorithm set to: ${algorithm}`);
    }
    
    /**
     * Set the number of pegs
     * @param {number} count - Number of pegs (3 or 4)
     */
    setPegCount(count) {
        if (count !== 3 && count !== 4) {
            throw new Error('Peg count must be 3 or 4');
        }
        
        // Frame-Stewart only works with 4 pegs
        if (this.selectedAlgorithm === 'frameStewart' && count !== 4) {
            throw new Error('Frame-Stewart algorithm requires 4 pegs');
        }
        
        this.pegCount = count;
        this.minMoves = this.calculateMinimumMoves();
        this.reset();
        logger.info(`Peg count set to: ${count}`);
    }
    
    /**
     * Set the number of disks
     * @param {number} count - Number of disks (1-10)
     */
    setDiskCount(count) {
        if (count < 1 || count > 10) {
            throw new Error('Disk count must be between 1 and 10');
        }
        
        this.diskCount = count;
        this.minMoves = this.calculateMinimumMoves();
        this.reset();
        logger.info(`Disk count set to: ${count}`);
    }
    
    /**
     * Get a solution for the current configuration
     * @returns {Object} - Solution object with moves and execution time
     */
    async getSolution() {
        try {
            // Start timer
            const solutionTimer = new Timer();
            solutionTimer.start();
            
            // Dynamically import the correct algorithm module
            const module = await algorithmModules[this.selectedAlgorithm]();
            
            // Generate solution
            const sourcePeg = 0;
            const targetPeg = this.pegCount - 1;
            const auxPegs = Array.from({ length: this.pegCount - 2 }, (_, i) => i + 1);
            
            let moves;
            
            if (this.selectedAlgorithm === 'frameStewart') {
                moves = module.default.solve(this.diskCount);
            } else if (this.pegCount === 3) {
                moves = module.default.solve(this.diskCount, sourcePeg, targetPeg, auxPegs[0]);
            } else {
                // For 4 pegs with non-Frame-Stewart algorithms, we still use the standard approach
                moves = module.default.solve(this.diskCount, sourcePeg, targetPeg, auxPegs[0]);
            }
            
            // Stop timer
            solutionTimer.stop();
            const executionTime = solutionTimer.getElapsedTimeMs() / 1000;
            
            logger.info(`Solution found with ${moves.length} moves using ${this.selectedAlgorithm} algorithm in ${executionTime} seconds`);
            
            // Create a database record for the solution and save performance metrics
            const sequelize = await getSequelize();
            const [result] = await sequelize.query(
                'INSERT INTO games (game_type, status, algorithm_used, solution_found, execution_time) VALUES (?, ?, ?, ?, ?) RETURNING id',
                {
                    replacements: [
                        'towerOfHanoi',
                        'completed',
                        this.selectedAlgorithm,
                        true,
                        executionTime
                    ],
                    type: sequelize.QueryTypes.INSERT
                }
            );
            
            const gameId = result[0].id;
            
            // Store the solution in tower_of_hanoi table
            await sequelize.query(
                `INSERT INTO tower_of_hanoi 
                (game_id, disk_count, move_count, move_sequence, algorithm_type, execution_time) 
                VALUES (?, ?, ?, ?, ?, ?)`,
                {
                    replacements: [
                        gameId,
                        this.diskCount,
                        moves.length,
                        JSON.stringify(moves),
                        this.selectedAlgorithm,
                        executionTime
                    ],
                    type: sequelize.QueryTypes.INSERT
                }
            );
            
            // Track algorithm performance
            await trackAlgorithmPerformance({
                gameId: gameId,
                algorithmName: this.selectedAlgorithm,
                executionTime: executionTime,
                solutionFound: true,
                iterations: moves.length,
                parameters: {
                    diskCount: this.diskCount,
                    pegCount: this.pegCount
                }
            });
            
            return {
                moves,
                moveCount: moves.length,
                executionTime,
                algorithm: this.selectedAlgorithm,
                gameId: gameId
            };
        } catch (error) {
            logger.error(`Error generating solution: ${error.message}`);
            throw error;
        }
    }
}

export default TowerOfHanoi;
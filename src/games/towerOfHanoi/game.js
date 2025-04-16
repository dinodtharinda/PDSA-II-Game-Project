/**
 * Tower of Hanoi Game Logic
 * 
 * This file contains the core game logic for the Tower of Hanoi puzzle.
 * It supports both 3-peg and 4-peg configurations and random disk numbers.
 */

const db = require('../../config/db');
const timer = require('../../utils/timer');
const logger = require('../../utils/logger');
const validator = require('../../utils/validator');
const recursiveAlgorithm = require('./algorithms/recursive');
const iterativeAlgorithm = require('./algorithms/iterative');
const frameStewartAlgorithm = require('./algorithms/frameStewart');

class TowerOfHanoi {
    constructor() {
        // Initialize with default values
        this.diskCount = this.getRandomDiskCount();
        this.pegCount = 3; // Default to 3 pegs
        this.reset();
        
        // Initialize performance tracking
        this.timer = new timer.Timer();
        this.moveCount = 0;
        this.optimalMoveCount = 0;
        
        // Algorithm selection
        this.selectedAlgorithm = 'recursive';
        
        // Game state
        this.isGameActive = false;
    }

    /**
     * Reset the game with current settings
     */
    reset() {
        // Create the pegs
        this.pegs = Array(this.pegCount).fill().map(() => []);
        
        // Initialize the first peg with all disks in descending order (largest at bottom)
        for (let i = this.diskCount; i >= 1; i--) {
            this.pegs[0].push(i);
        }
        
        this.moveCount = 0;
        this.moveSequence = [];
        this.isGameActive = true;
        this.startTime = new Date();
        
        // Calculate optimal move count based on algorithm and peg count
        this.calculateOptimalMoveCount();
        
        logger.info(`Tower of Hanoi game reset with ${this.diskCount} disks and ${this.pegCount} pegs`);
    }

    /**
     * Generate a random disk count between 5 and 10
     */
    getRandomDiskCount() {
        return Math.floor(Math.random() * 6) + 5; // 5-10 disks
    }

    /**
     * Set the number of disks
     * @param {number} count - Number of disks (5-10)
     */
    setDiskCount(count) {
        if (count < 5 || count > 10) {
            throw new Error('Disk count must be between 5 and 10');
        }
        this.diskCount = count;
        this.reset();
    }

    /**
     * Set the number of pegs (3 or 4)
     * @param {number} count - Number of pegs (3-4)
     */
    setPegCount(count) {
        if (count !== 3 && count !== 4) {
            throw new Error('Peg count must be either 3 or 4');
        }
        this.pegCount = count;
        this.reset();
    }

    /**
     * Set the algorithm to use for solution
     * @param {string} algorithm - Algorithm name ('recursive', 'iterative', or 'frameStewart')
     */
    setAlgorithm(algorithm) {
        const validAlgorithms = ['recursive', 'iterative', 'frameStewart'];
        if (!validAlgorithms.includes(algorithm)) {
            throw new Error(`Invalid algorithm. Must be one of: ${validAlgorithms.join(', ')}`);
        }
        
        // Frame-Stewart only works with 4 pegs
        if (algorithm === 'frameStewart' && this.pegCount !== 4) {
            throw new Error('Frame-Stewart algorithm requires 4 pegs');
        }
        
        this.selectedAlgorithm = algorithm;
        this.calculateOptimalMoveCount();
    }

    /**
     * Calculate the optimal move count based on algorithm and peg configuration
     */
    calculateOptimalMoveCount() {
        if (this.pegCount === 3) {
            // For 3 pegs, optimal solution is always 2^n - 1 moves
            this.optimalMoveCount = Math.pow(2, this.diskCount) - 1;
        } else if (this.pegCount === 4) {
            if (this.selectedAlgorithm === 'frameStewart') {
                // For 4 pegs with Frame-Stewart algorithm, calculations are more complex
                // This is an approximation based on the algorithm
                const k = Math.floor(Math.sqrt(2 * this.diskCount));
                let moveCount = Math.pow(2, this.diskCount - k) - 1 + 2 * Math.pow(2, k) - 1;
                this.optimalMoveCount = moveCount;
            } else {
                // Default to 3-peg algorithm optimal count for comparison
                this.optimalMoveCount = Math.pow(2, this.diskCount) - 1;
            }
        }
    }

    /**
     * Move a disk from one peg to another
     * @param {number} fromPeg - Source peg index (0-based)
     * @param {number} toPeg - Destination peg index (0-based)
     * @returns {boolean} - Whether the move was valid and executed
     */
    moveDisk(fromPeg, toPeg) {
        // Validate move
        if (!this.isValidMove(fromPeg, toPeg)) {
            return false;
        }
        
        // Execute move
        const disk = this.pegs[fromPeg].pop();
        this.pegs[toPeg].push(disk);
        
        // Record move
        this.moveCount++;
        this.moveSequence.push({ from: fromPeg, to: toPeg, disk });
        
        // Check if game is complete
        if (this.isGameComplete()) {
            this.endGame();
        }
        
        return true;
    }

    /**
     * Check if a move is valid
     * @param {number} fromPeg - Source peg index (0-based)
     * @param {number} toPeg - Destination peg index (0-based)
     * @returns {boolean} - Whether the move is valid
     */
    isValidMove(fromPeg, toPeg) {
        // Check if pegs are in range
        if (fromPeg < 0 || fromPeg >= this.pegCount || toPeg < 0 || toPeg >= this.pegCount) {
            return false;
        }
        
        // Check if source peg has disks
        if (this.pegs[fromPeg].length === 0) {
            return false;
        }
        
        // Check if destination peg can accept the disk (smaller disk on top of larger disk)
        const diskToMove = this.pegs[fromPeg][this.pegs[fromPeg].length - 1];
        if (this.pegs[toPeg].length > 0) {
            const topDiskAtDestination = this.pegs[toPeg][this.pegs[toPeg].length - 1];
            if (diskToMove > topDiskAtDestination) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * Check if the game is complete (all disks moved to the last peg)
     * @returns {boolean} - Whether the game is complete
     */
    isGameComplete() {
        return this.pegs[this.pegCount - 1].length === this.diskCount;
    }

    /**
     * End the game and record statistics
     */
    endGame() {
        this.isGameActive = false;
        const endTime = new Date();
        const durationMs = endTime - this.startTime;
        
        logger.info(`Tower of Hanoi game completed in ${this.moveCount} moves (optimal: ${this.optimalMoveCount})`);
        
        // Save game results to database
        this.saveGameResults(durationMs);
    }

    /**
     * Save game results to database
     * @param {number} durationMs - Game duration in milliseconds
     */
    async saveGameResults(durationMs) {
        try {
            // First create game entry
            const game = await db('games').insert({
                game_type: 'tower_of_hanoi',
                end_time: new Date(),
                result: this.moveCount === this.optimalMoveCount ? 'optimal' : 'completed'
            }).returning('id');
            
            const gameId = game[0];
            
            // Then save tower of hanoi specific data
            await db('tower_of_hanoi').insert({
                game_id: gameId,
                disk_count: this.diskCount,
                move_count: this.moveCount,
                move_sequence: JSON.stringify(this.moveSequence),
                algorithm_type: this.selectedAlgorithm,
                execution_time: durationMs / 1000 // Convert to seconds
            });
            
            logger.info(`Tower of Hanoi game results saved to database`);
        } catch (err) {
            logger.error(`Error saving Tower of Hanoi game results: ${err.message}`);
        }
    }

    /**
     * Get the solution for the current configuration
     * @returns {Array} - Array of moves to solve the puzzle
     */
    getSolution() {
        this.timer.start();
        
        let solution;
        if (this.selectedAlgorithm === 'recursive') {
            solution = recursiveAlgorithm.solve(this.diskCount, this.pegCount);
        } else if (this.selectedAlgorithm === 'iterative') {
            solution = iterativeAlgorithm.solve(this.diskCount, this.pegCount);
        } else if (this.selectedAlgorithm === 'frameStewart') {
            if (this.pegCount !== 4) {
                throw new Error('Frame-Stewart algorithm requires 4 pegs');
            }
            solution = frameStewartAlgorithm.solve(this.diskCount);
        }
        
        const executionTime = this.timer.stop();
        
        return {
            moves: solution,
            executionTime,
            moveCount: solution.length
        };
    }

    /**
     * Get current game state
     * @returns {Object} - Game state object
     */
    getGameState() {
        return {
            diskCount: this.diskCount,
            pegCount: this.pegCount,
            pegs: this.pegs.map(peg => [...peg]), // Create deep copy
            moveCount: this.moveCount,
            optimalMoveCount: this.optimalMoveCount,
            isGameComplete: this.isGameComplete(),
            isGameActive: this.isGameActive,
            selectedAlgorithm: this.selectedAlgorithm
        };
    }
}

module.exports = TowerOfHanoi;
/**
 * Tower of Hanoi Game Class
 * Implements Tower of Hanoi puzzle with 3 or 4 pegs and supports multiple solving algorithms
 */

import Timer from '../../utils/timer.js';
import logger from '../../utils/logger.js';

// Import algorithms
import recursiveSolver from './algorithms/recursive.js';
import iterativeSolver from './algorithms/iterative.js';
import frameStewartSolver from './algorithms/frameStewart.js';

// Import API service for database operations
import * as apiService from './services/api.js';

class TowerOfHanoi {
    constructor(options = {}) {
        // Set default options
        this.diskCount = options.diskCount || 3;
        this.pegCount = options.pegCount || 3;
        this.selectedAlgorithm = options.algorithm || 'recursive';
        
        // Core game state
        this.pegs = [];
        this.moves = 0;
        this.moveSequence = [];
        this.isGameActive = true;
        this.isGameComplete = false;
        this.minMoves = 0;
        this.targetPeg = this.pegCount - 1; // Default target is last peg
        
        // Performance tracking
        this.performanceMetrics = {};
        this.timer = new Timer();
        this.apiService = apiService;
        this.gameId = null;
        
        // Initialize game
        this.init();
    }
    
    /**
     * Initialize the game state
     */
    async init() {
        logger.info('Initializing Tower of Hanoi game');
        
        // Set up the initial state
        this.reset();
        
        // Create a new game record in the database
        try {
            this.gameId = await this.apiService.createGameRecord({
                diskCount: this.diskCount,
                pegCount: this.pegCount
            });
            
            logger.info(`Created new game record with ID: ${this.gameId}`);
        } catch (error) {
            logger.error('Failed to create game record:', error);
        }
    }
    
    /**
     * Reset the game to its initial state
     */
    reset() {
        // Reset game state
        this.pegs = Array.from({ length: this.pegCount }, () => []);
        this.moves = 0;
        this.moveSequence = [];
        this.isGameActive = true;
        this.isGameComplete = false;
        
        // Calculate minimum moves for the current setup
        if (this.pegCount === 3) {
            // Standard formula for 3-peg Tower of Hanoi
            this.minMoves = Math.pow(2, this.diskCount) - 1;
        } else {
            // For 4-peg Tower of Hanoi, use Frame-Stewart estimate
            // Technically this is an upper bound, not necessarily the minimum
            const frameStewartSolution = frameStewartSolver(this.diskCount);
            this.minMoves = frameStewartSolution.moveCount;
        }
        
        // Place all disks on the first peg
        // Disks are numbered from 1 (smallest) to diskCount (largest)
        // Disk size increases with index for visual representation
        for (let i = this.diskCount; i >= 1; i--) {
            this.pegs[0].push(i);
        }
    }
    
    /**
     * Get current game state
     * @returns {Object} Current game state
     */
    getGameState() {
        return {
            pegs: [...this.pegs],
            diskCount: this.diskCount,
            pegCount: this.pegCount,
            moves: this.moves,
            isGameActive: this.isGameActive,
            isGameComplete: this.isGameComplete,
            moveCount: this.moves,
            optimalMoveCount: this.minMoves
        };
    }
    
    /**
     * Make a move from source peg to target peg
     * @param {number} sourcePeg - Index of source peg
     * @param {number} targetPeg - Index of target peg
     * @returns {boolean} True if move was valid and executed, false otherwise
     */
    async makeMove(sourcePeg, targetPeg) {
        // Check if game is active
        if (!this.isGameActive) {
            logger.warn('Game is not active');
            return false;
        }
        
        // Validate peg indices
        if (
            sourcePeg < 0 || sourcePeg >= this.pegCount ||
            targetPeg < 0 || targetPeg >= this.pegCount ||
            sourcePeg === targetPeg
        ) {
            logger.warn(`Invalid peg indices: from ${sourcePeg} to ${targetPeg}`);
            return false;
        }
        
        // Check if source peg has any disks
        if (this.pegs[sourcePeg].length === 0) {
            logger.warn(`Source peg ${sourcePeg} is empty`);
            return false;
        }
        
        // Get the top disk from source peg
        const topDiskSize = this.pegs[sourcePeg][this.pegs[sourcePeg].length - 1];
        
        // Check if target peg is empty or top disk of target peg is larger
        if (
            this.pegs[targetPeg].length > 0 &&
            this.pegs[targetPeg][this.pegs[targetPeg].length - 1] < topDiskSize
        ) {
            logger.warn(`Cannot place disk ${topDiskSize} on top of disk ${this.pegs[targetPeg][this.pegs[targetPeg].length - 1]}`);
            return false;
        }
        
        // Move is valid, execute it
        const disk = this.pegs[sourcePeg].pop();
        this.pegs[targetPeg].push(disk);
        
        // Record the move
        this.moves++;
        this.moveSequence.push({ from: sourcePeg, to: targetPeg });
        
        // Check if game is won
        if (this.isGameWon()) {
            this.isGameComplete = true;
            this.isGameActive = false;
            
            // Save game completion to database
            try {
                await this.apiService.endGame(this.gameId, 'completed', {
                    moveCount: this.moves,
                    moveSequence: this.moveSequence
                });
                
                logger.info(`Game ${this.gameId} completed in ${this.moves} moves`);
            } catch (error) {
                logger.error('Failed to save game completion:', error);
            }
            
            return true;
        }
        
        return true;
    }
    
    /**
     * Check if the game is won
     * @returns {boolean} True if all disks are moved to the target peg
     */
    isGameWon() {
        // For solution algorithms, we need to check if all disks are on any peg other than the first
        // Since the default setup has all disks on the first peg (index 0)
        
        // First check if original peg is empty
        if (this.pegs[0].length === this.diskCount) {
            return false; // All disks are still on the starting peg
        }
        
        // Find a peg that has all the disks
        for (let pegIndex = 0; pegIndex < this.pegs.length; pegIndex++) {
            if (this.pegs[pegIndex].length === this.diskCount) {
                // Found a peg with all disks, now check if they're in correct order
                for (let i = 0; i < this.diskCount - 1; i++) {
                    // Check if disks are in ascending order (smaller on top)
                    if (this.pegs[pegIndex][i] < this.pegs[pegIndex][i + 1]) {
                        return false; // Disks are not in correct order
                    }
                }
                return true; // All disks are on this peg and in correct order
            }
        }
        
        // No peg has all disks
        return false;
    }
    
    /**
     * Set the disk count
     * @param {number} count - New disk count
     */
    setDiskCount(count) {
        if (count < 1 || count > 10) {
            throw new Error('Disk count must be between 1 and 10');
        }
        
        this.diskCount = count;
        this.reset();
    }
    
    /**
     * Set the peg count
     * @param {number} count - New peg count
     */
    setPegCount(count) {
        if (count !== 3 && count !== 4) {
            throw new Error('Peg count must be either 3 or 4');
        }
        
        // If changing from 3 to 4 pegs, make sure the algorithm is compatible
        if (count === 4 && this.selectedAlgorithm !== 'frameStewart') {
            logger.info('Switching to Frame-Stewart algorithm for 4 pegs');
            this.selectedAlgorithm = 'frameStewart';
        }
        
        // If changing from 4 to 3 pegs and using Frame-Stewart, switch to recursive
        if (count === 3 && this.selectedAlgorithm === 'frameStewart') {
            logger.info('Switching to recursive algorithm for 3 pegs');
            this.selectedAlgorithm = 'recursive';
        }
        
        this.pegCount = count;
        this.reset();
    }
    
    /**
     * Set the algorithm to use for solving
     * @param {string} algorithm - Algorithm name ('recursive', 'iterative', or 'frameStewart')
     */
    setAlgorithm(algorithm) {
        // Validate algorithm
        const validAlgorithms = ['recursive', 'iterative', 'frameStewart'];
        
        if (!validAlgorithms.includes(algorithm)) {
            throw new Error(`Invalid algorithm: ${algorithm}. Must be one of: ${validAlgorithms.join(', ')}`);
        }
        
        // Check compatibility with peg count
        if (algorithm === 'frameStewart' && this.pegCount !== 4) {
            throw new Error('Frame-Stewart algorithm requires 4 pegs');
        }
        
        this.selectedAlgorithm = algorithm;
        logger.info(`Algorithm set to: ${algorithm}`);
    }
    
    /**
     * Get a solution using the selected algorithm
     * @returns {Object} Solution with moves array and performance metrics
     */
    async getSolution() {
        logger.info(`Getting solution using ${this.selectedAlgorithm} algorithm`);
        
        // Reset game state first
        this.reset();
        
        let solution = null;
        let executionTime = 0;
        
        // Start timer
        this.timer.start();
        
        // Run selected algorithm
        try {
            switch (this.selectedAlgorithm) {
                case 'recursive':
                    solution = recursiveSolver(this.diskCount);
                    break;
                case 'iterative':
                    solution = iterativeSolver(this.diskCount);
                    break;
                case 'frameStewart':
                    if (this.pegCount !== 4) {
                        throw new Error('Frame-Stewart algorithm requires 4 pegs');
                    }
                    solution = frameStewartSolver(this.diskCount);
                    break;
                default:
                    throw new Error(`Unknown algorithm: ${this.selectedAlgorithm}`);
            }
            
            // Stop timer
            executionTime = this.timer.stop();
            
            // Record performance metrics
            this.performanceMetrics[this.selectedAlgorithm] = {
                diskCount: this.diskCount,
                pegCount: this.pegCount,
                moveCount: solution.moveCount,
                executionTime
            };
            
            // Save performance to database - fix: pass a single data object
            try {
                await this.apiService.saveAlgorithmPerformance({
                    gameId: this.gameId,
                    algorithmName: this.selectedAlgorithm,
                    executionTime: executionTime,
                    moveSequence: solution.moves
                });
                
                logger.info(`Saved algorithm performance for ${this.selectedAlgorithm}`);
            } catch (error) {
                logger.error('Failed to save algorithm performance:', error);
            }
            
            return {
                moves: solution.moves,
                moveCount: solution.moveCount,
                executionTime
            };
            
        } catch (error) {
            logger.error(`Error solving with ${this.selectedAlgorithm}:`, error);
            throw error;
        }
    }
    
    /**
     * Get the optimal moves required to solve the current configuration
     * @returns {number} Optimal move count
     */
    getOptimalMoveCount() {
        return this.minMoves;
    }
    
    /**
     * Get performance metrics for the algorithms
     * @returns {Object} Performance metrics for all algorithms used
     */
    getPerformanceMetrics() {
        return { ...this.performanceMetrics };
    }
    
    /**
     * Validate a player's move sequence
     * @param {Array} moveSequence - Array of {from, to} move objects
     * @returns {boolean} True if the move sequence solves the puzzle
     */
    async validateMoveSequence(moveSequence) {
        // Reset game state
        this.reset();
        
        // Try each move in the sequence
        for (const move of moveSequence) {
            const success = await this.makeMove(move.from, move.to);
            
            if (!success) {
                return false;
            }
        }
        
        // Check if game is won
        return this.isGameWon();
    }
}

// Add static init method for easier initialization
TowerOfHanoi.init = async function(options = {}) {
    try {
        const gameInstance = new TowerOfHanoi(options);
        await gameInstance.init();
        return gameInstance;
    } catch (error) {
        logger.error('Failed to initialize Tower of Hanoi game:', error);
        throw error;
    }
};

export default TowerOfHanoi;
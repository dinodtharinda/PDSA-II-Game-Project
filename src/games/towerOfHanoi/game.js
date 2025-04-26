/**
 * Tower of Hanoi Game Logic
 * 
 * This file contains the core game logic for the Tower of Hanoi puzzle.
 * It supports both 3-peg and 4-peg configurations and random disk numbers.
 */

const db = require('../../config/db');
const Timer = require('../../utils/timer');
const logger = require('../../utils/logger');
const validator = require('../../utils/validator');
const recursiveAlgorithm = require('./algorithms/recursive');
const iterativeAlgorithm = require('./algorithms/iterative');
const frameStewartAlgorithm = require('./algorithms/frameStewart');

class TowerOfHanoi {
    /**
     * Initialize a new Tower of Hanoi game
     * @param {number} disks - Number of disks (default: random between 5-10)
     * @param {number} pegCount - Number of pegs (3 or 4, default: 3)
     */
    constructor(disks = null, pegCount = 3) {
        // Initialize with parameter values or defaults
        this.disks = disks || this.getRandomDiskCount();
        this.pegCount = pegCount; // Default to 3 pegs
        
        // Initialize performance tracking
        this.timer = new Timer();
        this.moves = 0;
        this.minMoves = this.calculateMinimumMoves();
        
        // Algorithm selection
        this.selectedAlgorithm = 'recursive';
        
        // Game state
        this.isGameActive = false;
        
        // Initialize pegs
        this.reset();
    }

    /**
     * Reset the game with current settings
     */
    reset() {
        // Create the pegs
        this.pegs = Array(this.pegCount).fill().map(() => []);
        
        // Initialize the first peg with all disks in descending order (largest at bottom)
        for (let i = this.disks; i >= 1; i--) {
            this.pegs[0].push(i);
        }
        
        this.moves = 0;
        this.moveSequence = [];
        this.isGameActive = true;
        this.startTime = new Date();
        
        logger.info(`Tower of Hanoi game reset with ${this.disks} disks and ${this.pegCount} pegs`);
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
        if (count < 1 || count > 10) {
            throw new Error('Disk count must be between 1 and 10');
        }
        this.disks = count;
        this.minMoves = this.calculateMinimumMoves();
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
        this.minMoves = this.calculateMinimumMoves();
        this.reset();
    }

    /**
     * Set the algorithm to use for solution
     * @param {string} algorithm - Algorithm name ('recursive', 'iterative', or 'frameStewart')
     */
    setAlgorithm(algorithm) {
        const validAlgorithms = ['recursive', 'iterative', 'frame-stewart'];
        if (!validAlgorithms.includes(algorithm)) {
            throw new Error(`Invalid algorithm. Must be one of: ${validAlgorithms.join(', ')}`);
        }
        
        // Frame-Stewart only works with 4 pegs
        if (algorithm === 'frame-stewart' && this.pegCount !== 4) {
            throw new Error('Frame-Stewart algorithm requires 4 pegs');
        }
        
        this.selectedAlgorithm = algorithm;
    }

    /**
     * Calculate the minimum number of moves required to solve the puzzle
     * @returns {number} The minimum number of moves
     */
    calculateMinimumMoves() {
        if (this.pegCount === 3) {
            // For 3 pegs, optimal solution is always 2^n - 1 moves
            return Math.pow(2, this.disks) - 1;
        } else if (this.pegCount === 4) {
            // For 4 pegs, calculations are more complex (Frame-Stewart algorithm)
            // This is an approximation based on the algorithm
            const k = Math.floor(Math.sqrt(2 * this.disks));
            return Math.pow(2, this.disks - k) - 1 + 2 * Math.pow(2, k) - 1;
        }
    }

    /**
     * Move a disk from one peg to another
     * @param {number} fromPeg - Source peg index (0-based)
     * @param {number} toPeg - Destination peg index (0-based)
     * @returns {boolean} - Whether the move was valid and executed
     */
    makeMove(fromPeg, toPeg) {
        // Validate move
        if (!this.isMoveLegal(fromPeg, toPeg)) {
            return false;
        }
        
        // Execute move
        const disk = this.pegs[fromPeg].pop();
        this.pegs[toPeg].push(disk);
        
        // Record move
        this.moves++;
        this.moveSequence.push({ from: fromPeg, to: toPeg, disk });
        
        // Check if game is complete
        if (this.isGameWon()) {
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
    isMoveLegal(fromPeg, toPeg) {
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
    isGameWon() {
        // Game is won when the last peg has all disks
        return this.pegs[this.pegCount - 1].length === this.disks;
    }

    /**
     * End the game and record statistics
     */
    endGame() {
        this.isGameActive = false;
        const endTime = new Date();
        const durationMs = endTime - this.startTime;
        
        logger.info(`Tower of Hanoi game completed in ${this.moves} moves (optimal: ${this.minMoves})`);
        
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
            const result = await db.query(
                'INSERT INTO games (game_type, end_time, result) VALUES (?, ?, ?) RETURNING id',
                ['tower_of_hanoi', new Date(), this.moves === this.minMoves ? 'optimal' : 'completed']
            );
            
            const gameId = result.insertId;
            
            // Then save tower of hanoi specific data
            await db.query(
                `INSERT INTO tower_of_hanoi 
                (game_id, disk_count, move_count, move_sequence, algorithm_type, execution_time) 
                VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    gameId, 
                    this.disks, 
                    this.moves, 
                    JSON.stringify(this.moveSequence), 
                    this.selectedAlgorithm, 
                    durationMs / 1000 // Convert to seconds
                ]
            );
            
            logger.info(`Tower of Hanoi game results saved to database`);
        } catch (err) {
            logger.error(`Error saving Tower of Hanoi game results: ${err.message}`);
        }
    }

    /**
     * Get the solution from the server API
     * @param {string} algorithm - The algorithm to use ('recursive', 'iterative', 'frame-stewart')
     * @returns {Promise<Object>} - Promise resolving to the solution
     */
    async getSolution(algorithm = 'recursive') {
        try {
            const url = `/api/games/tower-of-hanoi/solve/${algorithm}`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    disks: this.disks
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Failed to get solution: ${errorData.error || 'Unknown error'}`);
            }
            
            return await response.json();
        } catch (error) {
            logger.error(`Error getting solution: ${error.message}`);
            throw error;
        }
    }

    /**
     * Apply a solution to the game
     * @param {Array<Object>} solution - Array of move objects
     */
    applySolution(solution) {
        // Reset game first
        this.reset();
        
        // Apply each move in the solution
        for (const move of solution) {
            this.makeMove(move.from, move.to);
        }
        
        return this.getGameState();
    }

    /**
     * Get current game state
     * @returns {Object} - Game state object
     */
    getGameState() {
        return {
            disks: this.disks,
            pegs: this.pegs.map(peg => [...peg]), // Create deep copy
            moves: this.moves,
            minMoves: this.minMoves,
            isWon: this.isGameWon()
        };
    }
}

module.exports = TowerOfHanoi;
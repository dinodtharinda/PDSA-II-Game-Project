import logger from '../../../utils/logger.js';
import { trackAlgorithmPerformance } from '../../../utils/performanceTracker.js';

/**
 * Solve Tower of Hanoi recursively
 * @param {number} n - Number of disks
 * @param {number} source - Source peg (0-based)
 * @param {number} target - Target peg (0-based)
 * @param {number} auxiliary - Auxiliary peg (0-based)
 * @returns {Array} Array of moves in format {from, to}
 */
export function solveRecursive(n, source = 0, target = 2, auxiliary = 1) {
    const moves = [];

    function moveDisks(disks, from, to, aux) {
        if (disks === 1) {
            moves.push({ from, to });
            return;
        }
        moveDisks(disks - 1, from, aux, to);
        moves.push({ from, to });
        moveDisks(disks - 1, aux, to, from);
    }

    try {
        moveDisks(n, source, target, auxiliary);
        logger.info(`Found recursive solution with ${moves.length} moves`);
        return moves;
    } catch (error) {
        logger.error(`Error in recursive solution: ${error.message}`);
        throw error;
    }
}

/**
 * Validate a solution for Tower of Hanoi
 * @param {Array} moves - Array of moves to validate
 * @param {number} diskCount - Number of disks
 * @returns {boolean} Whether the solution is valid
 */
export function validateSolution(moves, diskCount) {
    // Simulate the moves
    const pegs = [
        Array.from({length: diskCount}, (_, i) => diskCount - i),
        [],
        []
    ];

    try {
        for (const move of moves) {
            const { from, to } = move;
            
            // Check if source peg has disks
            if (pegs[from].length === 0) {
                return false;
            }

            const disk = pegs[from][pegs[from].length - 1];
            
            // Check if move is valid (smaller disk on larger disk)
            if (pegs[to].length > 0 && pegs[to][pegs[to].length - 1] < disk) {
                return false;
            }

            // Make the move
            pegs[to].push(pegs[from].pop());
        }

        // Check if all disks are on the target peg
        return pegs[2].length === diskCount && 
               pegs[2].every((disk, i) => disk === diskCount - i);
    } catch (error) {
        logger.error(`Error validating solution: ${error.message}`);
        return false;
    }
}

/**
 * Save performance metrics to database
 * @param {Object} game - Game instance
 * @param {string} algorithm - Algorithm name
 * @param {Object} result - Algorithm result
 * @returns {Promise<void>}
 */
export async function savePerformanceMetrics(game, algorithm, result) {
    if (!game.gameId) return;
  
    try {
        await trackAlgorithmPerformance({
            gameId: game.gameId,
            algorithmName: algorithm,
            executionTime: result.executionTime,
            solutionFound: result.success !== undefined ? result.success : true,
            iterations: result.moves.length,
            parameters: {
                diskCount: game.diskCount,
                pegCount: game.pegCount
            }
        });
        
        logger.info(`Performance metrics saved for recursive algorithm`);
    } catch (error) {
        logger.error(`Failed to save performance metrics: ${error.message}`);
    }
}

export default {
    solve: solveRecursive,
    validate: validateSolution,
    savePerformanceMetrics
};
import logger from '../../../utils/logger.js';
import { trackAlgorithmPerformance } from '../../../utils/performanceTracker.js';

/**
 * Solve Tower of Hanoi iteratively
 * @param {number} n - Number of disks
 * @param {number} source - Source peg (0-based)
 * @param {number} target - Target peg (0-based)
 * @param {number} auxiliary - Auxiliary peg (0-based)
 * @returns {Array} Array of moves in format {from, to}
 */
export function solveIterative(n, source = 0, target = 2, auxiliary = 1) {
    const moves = [];
    
    try {
        // For odd number of disks, follow pattern: source → target → auxiliary → source
        // For even number of disks, follow pattern: source → auxiliary → target → source
        const totalMoves = Math.pow(2, n) - 1;
        
        for (let i = 1; i <= totalMoves; i++) {
            // Get source and destination pegs for current move
            const [from, to] = getNextMove(i, n, source, auxiliary, target);
            moves.push({ from, to });
        }
        
        logger.info(`Found iterative solution with ${moves.length} moves`);
        return moves;
    } catch (error) {
        logger.error(`Error in iterative solution: ${error.message}`);
        throw error;
    }
}

/**
 * Get source and destination pegs for current move
 * @param {number} move - Current move number
 * @param {number} n - Total number of disks
 * @param {number} source - Source peg
 * @param {number} auxiliary - Auxiliary peg
 * @param {number} target - Target peg
 * @returns {Array} Array with [from, to] peg indices
 */
function getNextMove(move, n, source, auxiliary, target) {
    // Use binary representation of move number to determine disk to move
    const disk = getBitPosition(move);
    
    if (disk % 2 === 1) {
        // Odd numbered disks follow one pattern
        if (n % 2 === 1) {
            return [(move + source) % 3, (move + target) % 3];
        } else {
            return [(move + source) % 3, (move + auxiliary) % 3];
        }
    } else {
        // Even numbered disks follow another pattern
        if (n % 2 === 1) {
            return [(move + auxiliary) % 3, (move + target) % 3];
        } else {
            return [(move + target) % 3, (move + source) % 3];
        }
    }
}

/**
 * Get rightmost set bit position
 * @param {number} n - Number to check
 * @returns {number} Position of rightmost set bit
 */
function getBitPosition(n) {
    let position = 1;
    while ((n & 1) === 0) {
        n = n >> 1;
        position++;
    }
    return position;
}

/**
 * Validate a solution for Tower of Hanoi
 * @param {Array} moves - Array of moves to validate
 * @param {number} diskCount - Number of disks
 * @returns {boolean} Whether the solution is valid
 */
export function validateSolution(moves, diskCount) {
    const pegs = [
        Array.from({length: diskCount}, (_, i) => diskCount - i),
        [],
        []
    ];

    try {
        for (const move of moves) {
            const { from, to } = move;
            
            if (pegs[from].length === 0) {
                return false;
            }

            const disk = pegs[from][pegs[from].length - 1];
            
            if (pegs[to].length > 0 && pegs[to][pegs[to].length - 1] < disk) {
                return false;
            }

            pegs[to].push(pegs[from].pop());
        }

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
        
        logger.info(`Performance metrics saved for iterative algorithm`);
    } catch (error) {
        logger.error(`Failed to save performance metrics: ${error.message}`);
    }
}

export default {
    solve: solveIterative,
    validate: validateSolution,
    savePerformanceMetrics
};
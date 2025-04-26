/**
 * Frame-Stewart algorithm implementation for the Tower of Hanoi puzzle with 4 pegs.
 * 
 * This algorithm provides a more efficient solution for the 4-peg variant
 * of the Tower of Hanoi puzzle compared to the standard 3-peg recursive algorithm.
 * It's based on the Frame-Stewart approach, which is conjectured to be optimal for 4+ pegs.
 */

import Timer from '../../../utils/timer.js';
import logger from '../../../utils/logger.js';

/**
 * Solve the Tower of Hanoi puzzle using the Frame-Stewart algorithm for 4 pegs
 * @param {number} diskCount - Number of disks
 * @returns {Array} - Array of moves to solve the puzzle
 */
export function solve(diskCount) {
    // Validate inputs
    if (diskCount < 1) {
        throw new Error('Disk count must be at least 1');
    }
    
    // Initialize moves array
    const moves = [];
    
    // Frame-Stewart only works with 4 pegs
    const pegCount = 4;
    
    // Calculate the optimal value of k (number of disks to move in the first stage)
    // This is an approximation based on the Frame-Stewart algorithm
    const k = getOptimalK(diskCount);
    
    // Start solution
    frameStewart(diskCount, 0, 3, [1, 2], k, moves);
    
    logger.info(`Frame-Stewart algorithm found solution with ${moves.length} moves for ${diskCount} disks and 4 pegs`);
    
    return moves;
}

/**
 * Calculate the optimal value of k for the Frame-Stewart algorithm
 * @param {number} n - Number of disks
 * @returns {number} - Optimal k value
 */
function getOptimalK(n) {
    // A heuristic approach to find k such that: 2^(n-k) + 2^k - 2 is minimized
    // For practical purposes, k ≈ sqrt(2n) works well
    const k = Math.floor(Math.sqrt(2 * n));
    return Math.max(1, k);
}

/**
 * Recursive implementation of the Frame-Stewart algorithm
 * @param {number} numDisks - Number of disks to move
 * @param {number} fromPeg - Source peg index
 * @param {number} toPeg - Destination peg index
 * @param {Array} auxPegs - Array of auxiliary peg indices
 * @param {number} k - Number of disks to move in first stage
 * @param {Array} moves - Array to store the moves
 */
function frameStewart(numDisks, fromPeg, toPeg, auxPegs, k, moves) {
    if (numDisks === 0) {
        return;
    }
    
    if (numDisks === 1) {
        // Base case: move a single disk
        moves.push({ from: fromPeg, to: toPeg, disk: numDisks });
        return;
    }
    
    if (k >= numDisks) {
        // If k is greater than the number of disks, use the standard recursive solution
        classicalTOH(numDisks, fromPeg, toPeg, auxPegs[0], moves);
        return;
    }
    
    // Step 1: Move the top n-k disks from source to first auxiliary peg
    frameStewart(numDisks - k, fromPeg, auxPegs[0], [auxPegs[1], toPeg], getOptimalK(numDisks - k), moves);
    
    // Step 2: Move the remaining k disks from source to destination using the standard 3-peg algorithm
    classicalTOH(k, fromPeg, toPeg, auxPegs[1], moves);
    
    // Step 3: Move the n-k disks from the first auxiliary peg to the destination
    frameStewart(numDisks - k, auxPegs[0], toPeg, [fromPeg, auxPegs[1]], getOptimalK(numDisks - k), moves);
}

/**
 * Classical recursive solution for the 3-peg Tower of Hanoi
 * @param {number} numDisks - Number of disks to move
 * @param {number} fromPeg - Source peg index
 * @param {number} toPeg - Destination peg index
 * @param {number} auxPeg - Auxiliary peg index
 * @param {Array} moves - Array to store the moves
 */
function classicalTOH(numDisks, fromPeg, toPeg, auxPeg, moves) {
    if (numDisks === 1) {
        // Base case: move a single disk
        moves.push({ from: fromPeg, to: toPeg, disk: 1 });
        return;
    }
    
    // Move n-1 disks from source to auxiliary peg
    classicalTOH(numDisks - 1, fromPeg, auxPeg, toPeg, moves);
    
    // Move the nth disk from source to destination
    moves.push({ from: fromPeg, to: toPeg, disk: numDisks });
    
    // Move n-1 disks from auxiliary to destination
    classicalTOH(numDisks - 1, auxPeg, toPeg, fromPeg, moves);
}

export default { solve };
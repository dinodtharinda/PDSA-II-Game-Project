/**
 * Recursive algorithm implementation for the Tower of Hanoi puzzle.
 * 
 * This is the classical recursive solution that works optimally for the 3-peg variant,
 * and can be extended to the 4-peg variant (although not optimally).
 */

const timer = require('../../../utils/timer');
const logger = require('../../../utils/logger');

/**
 * Solve the Tower of Hanoi puzzle using the recursive algorithm
 * @param {number} diskCount - Number of disks
 * @param {number} pegCount - Number of pegs (3 or 4)
 * @returns {Array} - Array of moves to solve the puzzle
 */
exports.solve = function(diskCount, pegCount) {
    // Validate inputs
    if (diskCount < 1) {
        throw new Error('Disk count must be at least 1');
    }
    
    if (pegCount !== 3 && pegCount !== 4) {
        throw new Error('Peg count must be either 3 or 4');
    }
    
    // Initialize moves array
    const moves = [];
    
    // Start recursion
    if (pegCount === 3) {
        // For 3 pegs, use the standard recursive algorithm
        moveTower(diskCount, 0, 2, 1, moves);
    } else if (pegCount === 4) {
        // For 4 pegs, we still use recursion but less optimally than Frame-Stewart
        // We use the first 3 pegs to move all but the last disk, then move the last disk
        // to the 4th peg, then use the first 3 pegs to move the remaining disks to the 4th peg
        moveTower(diskCount - 1, 0, 1, 2, moves);
        moves.push({ from: 0, to: 3, disk: diskCount });
        moveTower(diskCount - 1, 1, 3, 2, moves);
    }
    
    logger.info(`Recursive algorithm found solution with ${moves.length} moves for ${diskCount} disks and ${pegCount} pegs`);
    
    return moves;
};

/**
 * Recursive function to move a tower of disks from one peg to another
 * @param {number} numDisks - Number of disks to move
 * @param {number} fromPeg - Source peg index
 * @param {number} toPeg - Destination peg index
 * @param {number} auxPeg - Auxiliary peg index
 * @param {Array} moves - Array to store the moves
 */
function moveTower(numDisks, fromPeg, toPeg, auxPeg, moves) {
    if (numDisks === 1) {
        // Base case: move a single disk
        moves.push({ from: fromPeg, to: toPeg, disk: numDisks });
        return;
    }
    
    // Move n-1 disks from source to auxiliary peg
    moveTower(numDisks - 1, fromPeg, auxPeg, toPeg, moves);
    
    // Move the nth disk from source to destination
    moves.push({ from: fromPeg, to: toPeg, disk: numDisks });
    
    // Move n-1 disks from auxiliary to destination
    moveTower(numDisks - 1, auxPeg, toPeg, fromPeg, moves);
}
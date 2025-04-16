/**
 * Iterative algorithm implementation for the Tower of Hanoi puzzle.
 * 
 * This provides a non-recursive solution to the Tower of Hanoi problem,
 * which can be more efficient for large numbers of disks as it avoids
 * the risk of stack overflow.
 */

const timer = require('../../../utils/timer');
const logger = require('../../../utils/logger');

/**
 * Solve the Tower of Hanoi puzzle using an iterative algorithm
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
    
    if (pegCount === 3) {
        // For 3 pegs, use the standard iterative algorithm
        solveThreePegs(diskCount, moves);
    } else {
        // For 4 pegs, revert to a 3-peg approach (less optimal)
        // Conceptually similar to the recursive approach for 4 pegs
        const subTowerMoves = [];
        solveThreePegs(diskCount - 1, subTowerMoves);
        
        // Modify the moves to use different pegs
        // First move n-1 disks from peg 0 to peg 1 using peg 2 as auxiliary
        for (let move of subTowerMoves) {
            moves.push(move);
        }
        
        // Move the largest disk to peg 3
        moves.push({ from: 0, to: 3, disk: diskCount });
        
        // Now move the n-1 disks from peg 1 to peg 3 using peg 2 as auxiliary
        for (let move of subTowerMoves) {
            const newFrom = move.from === 0 ? 1 : (move.from === 1 ? 0 : move.from);
            const newTo = move.to === 0 ? 1 : (move.to === 1 ? 3 : move.to);
            moves.push({ from: newFrom, to: newTo, disk: move.disk });
        }
    }
    
    logger.info(`Iterative algorithm found solution with ${moves.length} moves for ${diskCount} disks and ${pegCount} pegs`);
    
    return moves;
};

/**
 * Solve the 3-peg Tower of Hanoi puzzle using an iterative algorithm
 * @param {number} diskCount - Number of disks
 * @param {Array} moves - Array to store the moves
 */
function solveThreePegs(diskCount, moves) {
    // The total number of moves required is 2^n - 1
    const totalMoves = Math.pow(2, diskCount) - 1;
    
    /*
     * For even numbers of disks:
     * - Make the legal move between pegs 0 and 1
     * - Make the legal move between pegs 0 and 2
     * - Make the legal move between pegs 1 and 2
     * Repeat until done
     *
     * For odd numbers of disks:
     * - Make the legal move between pegs 0 and 2
     * - Make the legal move between pegs 0 and 1
     * - Make the legal move between pegs 1 and 2
     * Repeat until done
     */
    
    // Create an array to represent the pegs and their disks
    const pegs = [[], [], []];
    
    // Initialize the first peg with all disks
    for (let i = diskCount; i >= 1; i--) {
        pegs[0].push(i);
    }
    
    // For odd disk counts, swap the order of the first move sequence
    const isOddDiskCount = diskCount % 2 === 1;
    
    // Define the peg pairs for moves in the correct order
    const pegPairs = isOddDiskCount 
        ? [[0, 2], [0, 1], [1, 2]]  // Odd number of disks
        : [[0, 1], [0, 2], [1, 2]]; // Even number of disks
    
    // Iterate through all moves
    for (let moveIndex = 0; moveIndex < totalMoves; moveIndex++) {
        // Determine which peg pair to use for this move
        const pegPairIndex = moveIndex % 3;
        const [fromPegCandidate1, fromPegCandidate2] = pegPairs[pegPairIndex];
        
        // Determine which peg has the smaller top disk (or which one has a disk)
        let fromPeg, toPeg;
        
        if (pegs[fromPegCandidate1].length === 0) {
            // First peg is empty, must move from second peg
            fromPeg = fromPegCandidate2;
            toPeg = fromPegCandidate1;
        } else if (pegs[fromPegCandidate2].length === 0) {
            // Second peg is empty, must move from first peg
            fromPeg = fromPegCandidate1;
            toPeg = fromPegCandidate2;
        } else {
            // Both pegs have disks, compare top disks
            const topDisk1 = pegs[fromPegCandidate1][pegs[fromPegCandidate1].length - 1];
            const topDisk2 = pegs[fromPegCandidate2][pegs[fromPegCandidate2].length - 1];
            
            if (topDisk1 < topDisk2) {
                // Top disk on first peg is smaller
                fromPeg = fromPegCandidate1;
                toPeg = fromPegCandidate2;
            } else {
                // Top disk on second peg is smaller
                fromPeg = fromPegCandidate2;
                toPeg = fromPegCandidate1;
            }
        }
        
        // Make the move
        const disk = pegs[fromPeg].pop();
        pegs[toPeg].push(disk);
        
        // Record the move
        moves.push({ from: fromPeg, to: toPeg, disk });
    }
}
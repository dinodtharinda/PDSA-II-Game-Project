/**
 * Tower of Hanoi - Recursive Algorithm
 * Classical recursive implementation of the Tower of Hanoi solution
 */

/**
 * Solve Tower of Hanoi recursively
 * @param {number} n - Number of disks
 * @param {number} source - Source peg (0-based index)
 * @param {number} target - Target peg (0-based index)
 * @param {number} auxiliary - Auxiliary peg (0-based index)
 * @returns {Array} Array of move objects {from, to}
 */
function solveRecursive(n, source, target, auxiliary) {
    const moves = [];
    
    /**
     * Helper function to recursively solve Tower of Hanoi
     * @param {number} diskCount - Number of disks to move
     * @param {number} fromPeg - Source peg
     * @param {number} toPeg - Target peg
     * @param {number} auxPeg - Auxiliary peg
     */
    function hanoi(diskCount, fromPeg, toPeg, auxPeg) {
        if (diskCount === 1) {
            // Move the smallest disk directly from source to target
            moves.push({ from: fromPeg, to: toPeg });
            return;
        }
        
        // Move n-1 disks from source to auxiliary peg
        hanoi(diskCount - 1, fromPeg, auxPeg, toPeg);
        
        // Move the largest disk from source to target
        moves.push({ from: fromPeg, to: toPeg });
        
        // Move n-1 disks from auxiliary to target
        hanoi(diskCount - 1, auxPeg, toPeg, fromPeg);
    }
    
    // Start recursive solution
    hanoi(n, source, target, auxiliary);
    
    return {
        moves: moves,
        moveCount: moves.length
    };
}

/**
 * Solve the Tower of Hanoi puzzle using recursive algorithm
 * @param {number} diskCount - Number of disks
 * @param {number} source - Source peg (0-based, default 0)
 * @param {number} target - Target peg (0-based, default 2)
 * @param {number} auxiliary - Auxiliary peg (0-based, default 1)
 * @returns {Object} Solution with moves array and move count
 */
export function recursiveSolver(diskCount, source = 0, target = 2, auxiliary = 1) {
    return solveRecursive(diskCount, source, target, auxiliary);
}

export default recursiveSolver;
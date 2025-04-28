/**
 * Tower of Hanoi - Iterative Algorithm
 * Non-recursive implementation of Tower of Hanoi using a stack
 */

/**
 * Solve Tower of Hanoi iteratively
 * @param {number} n - Number of disks
 * @param {number} source - Source peg (0-based index)
 * @param {number} target - Target peg (0-based index)
 * @param {number} auxiliary - Auxiliary peg (0-based index)
 * @returns {Object} Solution with moves array and move count
 */
function solveIterative(n, source, target, auxiliary) {
    // Array to store the moves
    const moves = [];
    
    // If there are no disks, return empty solution
    if (n <= 0) {
        return { moves: [], moveCount: 0 };
    }
    
    // If there's only one disk, move it directly from source to target
    if (n === 1) {
        moves.push({ from: source, to: target });
        return { moves, moveCount: 1 };
    }
    
    // Create arrays to represent pegs
    const pegs = [[], [], []];
    
    // Initialize source peg with all disks (largest at bottom)
    for (let i = n; i > 0; i--) {
        pegs[source].push(i);
    }
    
    // For odd number of disks, apply standard solution
    const totalMoves = Math.pow(2, n) - 1;
    
    // Define the three pegs (source, auxiliary, target) as 0, 1, 2
    const pegIndices = [source, auxiliary, target];
    
    // Function to find a valid move between two pegs
    const findValidMove = (firstPeg, secondPeg) => {
        // If first peg is empty, move must be from second to first
        if (pegs[firstPeg].length === 0) {
            return { from: secondPeg, to: firstPeg };
        }
        
        // If second peg is empty, move must be from first to second
        if (pegs[secondPeg].length === 0) {
            return { from: firstPeg, to: secondPeg };
        }
        
        // Both pegs have disks, compare the top disks
        const topDiskFirstPeg = pegs[firstPeg][pegs[firstPeg].length - 1];
        const topDiskSecondPeg = pegs[secondPeg][pegs[secondPeg].length - 1];
        
        // Always move the smaller disk onto the larger disk
        if (topDiskFirstPeg < topDiskSecondPeg) {
            return { from: firstPeg, to: secondPeg };
        } else {
            return { from: secondPeg, to: firstPeg };
        }
    };
    
    // Iteratively make all required moves
    for (let i = 1; i <= totalMoves; i++) {
        let move;
        
        // For odd number of disks:
        // - Move between source and target
        // - Move between source and auxiliary
        // - Move between auxiliary and target
        // For even number of disks, we alternate the pattern
        if (n % 2 === 1) {
            if (i % 3 === 1) {
                move = findValidMove(source, target);
            } else if (i % 3 === 2) {
                move = findValidMove(source, auxiliary);
            } else {
                move = findValidMove(auxiliary, target);
            }
        } else {
            if (i % 3 === 1) {
                move = findValidMove(source, auxiliary);
            } else if (i % 3 === 2) {
                move = findValidMove(source, target);
            } else {
                move = findValidMove(auxiliary, target);
            }
        }
        
        // Execute the move
        const { from, to } = move;
        const disk = pegs[from].pop();
        pegs[to].push(disk);
        
        // Record the move
        moves.push({ from, to });
    }
    
    return {
        moves: moves,
        moveCount: moves.length
    };
}

/**
 * Solve the Tower of Hanoi puzzle using iterative algorithm
 * @param {number} diskCount - Number of disks
 * @param {number} source - Source peg (0-based, default 0)
 * @param {number} target - Target peg (0-based, default 2)
 * @param {number} auxiliary - Auxiliary peg (0-based, default 1)
 * @returns {Object} Solution with moves array and move count
 */
export function iterativeSolver(diskCount, source = 0, target = 2, auxiliary = 1) {
    return solveIterative(diskCount, source, target, auxiliary);
}

export default iterativeSolver;
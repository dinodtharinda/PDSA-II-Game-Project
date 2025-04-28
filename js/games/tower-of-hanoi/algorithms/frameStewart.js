/**
 * Frame-Stewart algorithm for the 4-peg Tower of Hanoi problem
 * This implements the Frame-Stewart algorithm which is more efficient for the 4-peg variant
 */

/**
 * Find the optimal number of disks to move in the first step of Frame-Stewart
 * @param {number} n - Number of disks
 * @returns {number} - Optimal number of disks for the first move
 */
function findOptimalK(n) {
    // Returns optimal k for n disks in the Frame-Stewart algorithm
    // This is a heuristic: for n ≤ 12, k = √n is a good approximation
    return Math.floor(Math.sqrt(n));
}

/**
 * Frame-Stewart algorithm implementation for 4 pegs
 * @param {number} n - Number of disks
 * @param {number} source - Source peg (0-3)
 * @param {number} target - Target peg (0-3)
 * @param {number[]} aux - Auxiliary pegs (0-3)
 * @param {Array} moves - Array to collect the moves
 */
function frameStewart(n, source, target, aux, moves) {
    // Base case: If only one disk, move it directly
    if (n === 1) {
        moves.push({ from: source, to: target });
        return;
    }
    
    // Base case: For n=2 with 4 pegs, this is optimal
    if (n === 2) {
        moves.push({ from: source, to: aux[0] });
        moves.push({ from: source, to: target });
        moves.push({ from: aux[0], to: target });
        return;
    }
    
    // Find optimal k
    const k = findOptimalK(n);
    
    // Step 1: Move top n-k disks to the first auxiliary peg using all 4 pegs
    // Important: When recursively moving disks, ensure disk numbers are relative to each subproblem
    frameStewart(n - k, source, aux[0], [aux[1], target], moves);
    
    // Step 2: Move the remaining k largest disks to the target using standard 3-peg algorithm
    // This is the classic Tower of Hanoi with 3 pegs
    moveDisks(k, source, target, aux[1], moves);
    
    // Step 3: Move the n-k smaller disks from auxiliary to target using all 4 pegs
    // Again, ensure disk numbers are relative to this subproblem
    frameStewart(n - k, aux[0], target, [aux[1], source], moves);
}

/**
 * Standard 3-peg Tower of Hanoi algorithm for the Frame-Stewart method
 * @param {number} n - Number of disks
 * @param {number} source - Source peg (0-3)
 * @param {number} target - Target peg (0-3)
 * @param {number} auxiliary - Auxiliary peg (0-3)
 * @param {Array} moves - Array to collect the moves
 */
function moveDisks(n, source, target, auxiliary, moves) {
    if (n === 1) {
        moves.push({ from: source, to: target });
        return;
    }
    
    // Move n-1 disks from source to auxiliary peg
    moveDisks(n - 1, source, auxiliary, target, moves);
    
    // Move the largest disk (nth disk) from source to target
    moves.push({ from: source, to: target });
    
    // Move n-1 disks from auxiliary peg to target
    moveDisks(n - 1, auxiliary, target, source, moves);
}

/**
 * Solve the 4-peg Tower of Hanoi problem using Frame-Stewart algorithm
 * @param {number} diskCount - Number of disks
 * @returns {Object} - Solution with moves array and move count
 */
export function frameStewartSolver(diskCount) {
    const moves = [];
    
    // For 4 pegs, we use the Frame-Stewart algorithm
    // Standard peg numbering: 0 (source), 1 & 2 (auxiliary), 3 (target)
    frameStewart(diskCount, 0, 3, [1, 2], moves);
    
    return {
        moves: moves,
        moveCount: moves.length
    };
}

export default frameStewartSolver;
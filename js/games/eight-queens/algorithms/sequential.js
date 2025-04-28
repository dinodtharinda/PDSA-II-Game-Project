/**
 * Eight Queens Sequential Algorithm (Backtracking)
 */

/**
 * Check if placing a queen at board[row][col] is safe.
 * @param {Array<Array<boolean>>} board - The current board state.
 * @param {number} row - The row to check.
 * @param {number} col - The column to check.
 * @param {number} N - The size of the board.
 * @returns {boolean} True if safe, false otherwise.
 */
function isSafe(board, row, col, N) {
    // Check this row on left side
    for (let i = 0; i < col; i++) {
        if (board[row][i]) {
            return false;
        }
    }

    // Check upper diagonal on left side
    for (let i = row, j = col; i >= 0 && j >= 0; i--, j--) {
        if (board[i][j]) {
            return false;
        }
    }

    // Check lower diagonal on left side
    for (let i = row, j = col; j >= 0 && i < N; i++, j--) {
        if (board[i][j]) {
            return false;
        }
    }

    return true;
}

/**
 * Recursive utility function to solve N Queens problem.
 * @param {Array<Array<boolean>>} board - The current board state.
 * @param {number} col - The current column being processed.
 * @param {number} N - The size of the board.
 * @param {Array<Array<Object>>} solutions - Array to store found solutions.
 * @param {number} maxSolutions - Maximum number of solutions to find (0 for all).
 * @returns {boolean} True if a solution limit is reached, false otherwise.
 */
function solveNQUtil(board, col, N, solutions, maxSolutions) {
    // Base case: If all queens are placed
    if (col >= N) {
        const solution = [];
        for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) {
                if (board[i][j]) {
                    solution.push({ row: i, col: j });
                }
            }
        }
        solutions.push(solution);
        // Check if we reached the maximum number of solutions needed
        return maxSolutions > 0 && solutions.length >= maxSolutions;
    }

    // Consider this column and try placing this queen in all rows one by one
    for (let i = 0; i < N; i++) {
        if (isSafe(board, i, col, N)) {
            // Place this queen in board[i][col]
            board[i][col] = true;

            // Recur to place rest of the queens
            if (solveNQUtil(board, col + 1, N, solutions, maxSolutions)) {
                return true; // Stop if maxSolutions reached
            }

            // If placing queen in board[i][col] doesn't lead to a solution,
            // then remove queen from board[i][col] (Backtrack)
            board[i][col] = false;
        }
    }

    // If the queen cannot be placed in any row in this column, return false
    return false;
}

/**
 * Solves the N-Queens problem using backtracking.
 * @param {Object} options - Options object.
 * @param {number} [options.boardSize=8] - The size of the board (N).
 * @param {number} [options.maxSolutions=0] - Max solutions to find (0 for all).
 * @returns {Promise<Array<Array<Object>>>} A promise that resolves with an array of solutions.
 */
async function solve({ boardSize = 8, maxSolutions = 0 } = {}) {
    const N = boardSize;
    const board = Array(N).fill(0).map(() => Array(N).fill(false));
    const solutions = [];

    solveNQUtil(board, 0, N, solutions, maxSolutions);

    // Ensure solutions are returned in the expected format [{row, col}, ...]
    // The current implementation already does this.

    return solutions;
}

export default solve;

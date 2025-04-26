/**
 * Sequential algorithm for solving the Eight Queens puzzle
 * 
 * This is a backtracking algorithm that places queens one column at a time,
 * moving to the next column only when a valid position is found.
 */

import logger from '../../../utils/logger.js';

/**
 * Check if placing a queen at [row, col] conflicts with existing queens
 * @param {Array<Array<Number>>} board - 2D board with queen positions
 * @param {Number} row - Row to check
 * @param {Number} col - Column to check
 * @returns {Boolean} Whether the position is safe
 */
const isSafe = (board, row, col) => {
    // Check row on left side
    for (let i = 0; i < col; i++) {
        if (board[row][i] === 1) {
            return false;
        }
    }

    // Check upper diagonal on left side
    for (let i = row, j = col; i >= 0 && j >= 0; i--, j--) {
        if (board[i][j] === 1) {
            return false;
        }
    }

    // Check lower diagonal on left side
    for (let i = row, j = col; i < 8 && j >= 0; i++, j--) {
        if (board[i][j] === 1) {
            return false;
        }
    }

    return true;
};

/**
 * Recursively solve the Eight Queens puzzle with backtracking
 * 
 * @param {Array<Array<Number>>} board - 2D board with queen positions
 * @param {Number} col - Current column
 * @param {Array<Array<Number>>} solutions - Array to store solutions
 * @param {Number} maxSolutions - Maximum number of solutions to find (0 for all)
 * @returns {Boolean} Whether a solution was found
 */
const solveNQueensUtil = (board, col, solutions, maxSolutions = 0) => {
    // Base case: If all queens are placed
    if (col >= 8) {
        // Convert board to solution format (row index for each column)
        const solution = board.map(row => row.indexOf(1));
        solutions.push(solution);
        
        // If we've found enough solutions, return true to stop recursion
        return maxSolutions > 0 && solutions.length >= maxSolutions;
    }

    // Try placing the queen in each row of the current column
    for (let row = 0; row < 8; row++) {
        // Check if queen can be placed
        if (isSafe(board, row, col)) {
            // Place the queen
            board[row][col] = 1;

            // Recursively try placing the rest of queens
            if (solveNQueensUtil(board, col + 1, solutions, maxSolutions)) {
                return true;
            }

            // If placing queen doesn't lead to a solution, backtrack
            board[row][col] = 0;
        }
    }

    // If queen can't be placed in any row in this column
    return false;
};

/**
 * Solve the Eight Queens puzzle using a sequential backtracking algorithm
 * @param {Object} options - Options for the algorithm
 * @param {Number} options.maxSolutions - Maximum number of solutions to find (0 for all)
 * @returns {Array<Array<Number>>} Array of solutions
 */
export const solve = async (options = {}) => {
    const maxSolutions = options.maxSolutions || 0;
    const solutions = [];
    
    try {
        // Initialize empty board
        const board = Array(8).fill().map(() => Array(8).fill(0));
        
        logger.info('Starting sequential Eight Queens solver');
        solveNQueensUtil(board, 0, solutions, maxSolutions);
        logger.info(`Found ${solutions.length} solutions`);
        
        return solutions;
    } catch (error) {
        logger.error(`Error in sequential Eight Queens solver: ${error.message}`);
        return [];
    }
};

export default solve;
/**
 * Threaded algorithm for solving the Eight Queens puzzle
 * 
 * This implementation emulates a multi-threaded approach for finding solutions
 * by dividing the work based on the initial queen placement in the first few rows.
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
 * Create a partial board with queens in the first N columns
 * @param {Array<Number>} initialPositions - Row positions for initial columns
 * @returns {Array<Array<Number>>} Board with initial queens placed
 */
const createPartialBoard = (initialPositions) => {
    const board = Array(8).fill().map(() => Array(8).fill(0));
    
    // Place queens in specified positions
    for (let col = 0; col < initialPositions.length; col++) {
        const row = initialPositions[col];
        board[row][col] = 1;
    }
    
    return board;
};

/**
 * Find all solutions with queens initially placed in specific positions
 * @param {Array<Number>} initialPositions - Row positions for initial columns
 * @param {Number} maxSolutions - Maximum solutions to find
 * @returns {Array<Array<Number>>} Array of solutions
 */
const findSolutionsWithInitialPositions = (initialPositions, maxSolutions) => {
    const solutions = [];
    const board = createPartialBoard(initialPositions);
    
    // Start solving from the column after our initial positions
    solveNQueensUtil(board, initialPositions.length, solutions, maxSolutions);
    
    return solutions;
};

/**
 * Generate initial queen positions to distribute work across "threads"
 * @param {Number} threadCount - Number of parallel tasks to create
 * @returns {Array<Array<Number>>} Array of initial positions for each thread
 */
const distributeWork = (threadCount) => {
    // For 8 threads, we'll place the first queen in each possible row
    if (threadCount >= 8) {
        return Array(8).fill().map((_, i) => [i]);
    }
    
    // For 4 threads, we'll place the queen in positions 0, 2, 4, 6
    if (threadCount === 4) {
        return [[0], [2], [4], [6]];
    }
    
    // For 2 threads, we'll place the queen in positions 0, 4
    if (threadCount === 2) {
        return [[0], [4]];
    }
    
    // Default to just starting from the beginning
    return [[]];
};

/**
 * Run multiple "threaded" tasks in parallel
 * @param {Array<Function>} tasks - Array of async functions to run
 * @returns {Promise<Array>} Combined results from all tasks
 */
const runParallelTasks = async (tasks) => {
    try {
        const results = await Promise.all(tasks);
        return results.flat();
    } catch (error) {
        logger.error(`Error in parallel tasks: ${error.message}`);
        return [];
    }
};

/**
 * Solve the Eight Queens puzzle using a threaded approach
 * @param {Object} options - Options for the algorithm
 * @param {Number} options.maxSolutions - Maximum number of solutions to find (0 for all)
 * @param {Number} options.threads - Number of threads to use (default: 4)
 * @returns {Array<Array<Number>>} Array of solutions
 */
export const solve = async (options = {}) => {
    const maxSolutions = options.maxSolutions || 0;
    const threadCount = options.threads || 4;
    
    try {
        logger.info(`Starting threaded Eight Queens solver with ${threadCount} threads`);
        
        const initialPositions = distributeWork(threadCount);
        const maxSolutionsPerThread = maxSolutions > 0 ? Math.ceil(maxSolutions / threadCount) : 0;
        
        // Create tasks for each "thread" - in a browser environment,
        // we're simulating threads using the asynchronous Promise.all
        const tasks = initialPositions.map(positions => 
            Promise.resolve(findSolutionsWithInitialPositions(positions, maxSolutionsPerThread))
        );
        
        // Run "tasks" in parallel
        const solutions = await runParallelTasks(tasks);
        
        // Limit to the requested maximum number of solutions
        const limitedSolutions = maxSolutions > 0 
            ? solutions.slice(0, maxSolutions)
            : solutions;
            
        logger.info(`Found ${limitedSolutions.length} solutions using threaded solver`);
        return limitedSolutions;
    } catch (error) {
        logger.error(`Error in threaded Eight Queens solver: ${error.message}`);
        return [];
    }
};

export default solve;
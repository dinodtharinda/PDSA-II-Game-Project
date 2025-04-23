/**
 * Backtracking Algorithm for Knight's Tour
 * This algorithm uses a recursive backtracking approach to find a Knight's Tour solution
 */
const Timer = require('../../../utils/timer');
const logger = require('../../../utils/logger');

/**
 * Find a Knight's Tour using backtracking
 * @param {Object} game - KnightsTour game instance
 * @returns {Array} Solution path as array of positions {row, col}
 */
function findKnightsTour(game) {
    const timer = new Timer();
    timer.start();
    
    const board = [];
    const size = game.size;
    
    // Initialize board with -1 (unvisited)
    for (let i = 0; i < size; i++) {
        board[i] = new Array(size).fill(-1);
    }
    
    // Possible moves of a knight
    const moveX = [2, 1, -1, -2, -2, -1, 1, 2];
    const moveY = [1, 2, 2, 1, -1, -2, -2, -1];
    
    // Start position
    const startRow = game.startPosition.row;
    const startCol = game.startPosition.col;
    
    // Mark start position as visited (move 0)
    board[startRow][startCol] = 0;
    
    // Array to hold the solution
    const solution = [{ row: startRow, col: startCol }];
    
    // Try to solve using backtracking
    if (solveKnightsTour(board, startRow, startCol, 1, size, moveX, moveY, solution)) {
        const executionTime = timer.getElapsedTime();
        logger.info(`Backtracking algorithm found solution in ${executionTime} seconds`);
        
        // Save performance metrics to database
        savePerformanceMetrics(game, 'backtracking', solution, executionTime);
        
        return solution;
    }
    
    logger.warn('Backtracking algorithm failed to find a solution');
    return null;
}

/**
 * Recursive function to solve Knight's Tour using backtracking
 * @param {Array} board - 2D array representing the board
 * @param {number} x - Current row position
 * @param {number} y - Current column position
 * @param {number} moveCount - Current move count
 * @param {number} size - Board size
 * @param {Array} moveX - Knight x-move possibilities
 * @param {Array} moveY - Knight y-move possibilities
 * @param {Array} solution - Array to store solution path
 * @returns {boolean} True if solution found
 */
function solveKnightsTour(board, x, y, moveCount, size, moveX, moveY, solution) {
    // If all squares are visited, we found a solution
    if (moveCount === size * size) {
        return true;
    }
    
    // Try all next moves from current position
    for (let i = 0; i < 8; i++) {
        const nextX = x + moveX[i];
        const nextY = y + moveY[i];
        
        // Check if the move is valid
        if (isValidMove(nextX, nextY, board, size)) {
            // Make this move
            board[nextX][nextY] = moveCount;
            solution.push({ row: nextX, col: nextY });
            
            // Recursively try to solve from this new position
            if (solveKnightsTour(board, nextX, nextY, moveCount + 1, size, moveX, moveY, solution)) {
                return true;
            }
            
            // If this move doesn't lead to a solution, backtrack
            board[nextX][nextY] = -1;
            solution.pop();
        }
    }
    
    // If no move works, return false
    return false;
}

/**
 * Check if a move is valid
 * @param {number} x - Row position to check
 * @param {number} y - Column position to check
 * @param {Array} board - Board representation
 * @param {number} size - Board size
 * @returns {boolean} True if move is valid
 */
function isValidMove(x, y, board, size) {
    return (
        x >= 0 && y >= 0 && 
        x < size && y < size && 
        board[x][y] === -1
    );
}

/**
 * Save algorithm performance metrics to database
 * @param {Object} game - Game instance
 * @param {string} algorithm - Algorithm name
 * @param {Array} solution - Solution path
 * @param {number} executionTime - Algorithm execution time
 */
async function savePerformanceMetrics(game, algorithm, solution, executionTime) {
    try {
        if (!game.gameId) {
            await game.createGameEntry();
        }
        
        const startPosition = game.toAlgebraicNotation(game.startPosition.row, game.startPosition.col);
        
        // Get move sequence in algebraic notation
        const moveSequenceNotation = solution.map(move => 
            game.toAlgebraicNotation(move.row, move.col)
        ).join(',');
        
        // Insert record into database
        await require('../../../config/db').query(
            'INSERT INTO knights_tour (game_id, start_position, move_sequence, algorithm_type, execution_time) VALUES (?, ?, ?, ?, ?)',
            [
                game.gameId,
                startPosition,
                moveSequenceNotation,
                algorithm,
                executionTime
            ]
        );
        
        logger.info(`Performance metrics saved for ${algorithm} algorithm`);
    } catch (error) {
        logger.error(`Failed to save performance metrics: ${error.message}`);
    }
}

module.exports = { findKnightsTour };
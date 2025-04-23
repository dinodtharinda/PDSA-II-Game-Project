/**
 * Warnsdorff's Algorithm for Knight's Tour
 * This algorithm uses a heuristic approach to find a Knight's Tour solution
 * by always moving to the square with the fewest onward moves
 */
const Timer = require('../../../utils/timer');
const logger = require('../../../utils/logger');

/**
 * Find a Knight's Tour using Warnsdorff's algorithm
 * @param {Object} game - KnightsTour game instance
 * @returns {Array} Solution path as array of positions {row, col}
 */
function findKnightsTour(game) {
    const timer = new Timer();
    timer.start();
    
    const size = game.size;
    const board = [];
    
    // Initialize board with zeros (unvisited)
    for (let i = 0; i < size; i++) {
        board[i] = new Array(size).fill(0);
    }
    
    // Possible moves of a knight
    const moveX = [2, 1, -1, -2, -2, -1, 1, 2];
    const moveY = [1, 2, 2, 1, -1, -2, -2, -1];
    
    // Start position
    const startRow = game.startPosition.row;
    const startCol = game.startPosition.col;
    
    // Mark start position as visited (move 1)
    board[startRow][startCol] = 1;
    
    // Array to hold the solution
    const solution = [{ row: startRow, col: startCol }];
    
    // Current position
    let currentRow = startRow;
    let currentCol = startCol;
    
    // Warnsdorff's algorithm: try to visit all squares
    for (let moveCount = 2; moveCount <= size * size; moveCount++) {
        // Find next move using Warnsdorff's heuristic
        const nextMove = findNextMove(currentRow, currentCol, board, size, moveX, moveY);
        
        // If no next move is possible, we're stuck
        if (!nextMove) {
            logger.warn(`Warnsdorff's algorithm got stuck after ${moveCount - 1} moves`);
            return null;
        }
        
        // Make the move
        currentRow = nextMove.x;
        currentCol = nextMove.y;
        board[currentRow][currentCol] = moveCount;
        solution.push({ row: currentRow, col: currentCol });
    }
    
    const executionTime = timer.getElapsedTime();
    logger.info(`Warnsdorff's algorithm found solution in ${executionTime} seconds`);
    
    // Save performance metrics to database
    savePerformanceMetrics(game, 'warnsdorff', solution, executionTime);
    
    return solution;
}

/**
 * Find the next move according to Warnsdorff's heuristic
 * @param {number} x - Current row position
 * @param {number} y - Current column position
 * @param {Array} board - Board representation
 * @param {number} size - Board size
 * @param {Array} moveX - Knight x-move possibilities
 * @param {Array} moveY - Knight y-move possibilities
 * @returns {Object|null} Next move position {x, y} or null if no move possible
 */
function findNextMove(x, y, board, size, moveX, moveY) {
    let minDegree = Infinity;
    let minDegreeX = -1;
    let minDegreeY = -1;
    
    // Try all possible moves
    for (let i = 0; i < 8; i++) {
        const nextX = x + moveX[i];
        const nextY = y + moveY[i];
        
        // Check if move is valid
        if (isValidMove(nextX, nextY, board, size)) {
            // Count the number of onward moves from this position (its 'degree')
            const degree = countAccessibleSquares(nextX, nextY, board, size, moveX, moveY);
            
            // Choose the move with the minimum degree (Warnsdorff's heuristic)
            if (degree < minDegree) {
                minDegree = degree;
                minDegreeX = nextX;
                minDegreeY = nextY;
            }
        }
    }
    
    // If we found a next move
    if (minDegreeX !== -1 && minDegreeY !== -1) {
        return { x: minDegreeX, y: minDegreeY };
    }
    
    // No valid move found
    return null;
}

/**
 * Count the number of accessible squares from a position
 * @param {number} x - Row position to check from
 * @param {number} y - Column position to check from
 * @param {Array} board - Board representation
 * @param {number} size - Board size
 * @param {Array} moveX - Knight x-move possibilities
 * @param {Array} moveY - Knight y-move possibilities
 * @returns {number} Number of accessible squares
 */
function countAccessibleSquares(x, y, board, size, moveX, moveY) {
    let count = 0;
    
    // Check all possible knight moves
    for (let i = 0; i < 8; i++) {
        const nextX = x + moveX[i];
        const nextY = y + moveY[i];
        
        if (isValidMove(nextX, nextY, board, size)) {
            count++;
        }
    }
    
    return count;
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
        board[x][y] === 0
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
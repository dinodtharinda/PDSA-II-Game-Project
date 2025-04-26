import logger from '../../../utils/logger.js';
import { trackAlgorithmPerformance } from '../../../utils/performanceTracker.js';

// Define knight's possible moves (L-shape)
const knightMoves = [
  [-2, -1], [-2, 1], [-1, -2], [-1, 2],
  [1, -2], [1, 2], [2, -1], [2, 1]
];

// Check if a position is valid and unvisited
function isValidPosition(row, col, visited, size) {
  return (
    row >= 0 && row < size && 
    col >= 0 && col < size && 
    visited[row][col] === 0
  );
}

/**
 * Find a knight's tour using Warnsdorff's heuristic
 * @param {Object} options - Algorithm options
 * @param {Object} options.startPosition - Starting position {row, col}
 * @param {number} options.boardSize - Size of the board (e.g., 8 for 8x8)
 * @returns {Promise<Object>} - Algorithm result
 */
export default async function findKnightsTour(options) {
  const startTime = performance.now();
  const { startPosition, boardSize } = options;
  
  // Initialize the board with zeros (unvisited)
  const visited = Array(boardSize).fill().map(() => Array(boardSize).fill(0));
  const tour = [];
  
  // Set the starting position
  const { row, col } = startPosition;
  visited[row][col] = 1; // Mark as visited
  tour.push({ row, col });
  
  let moveCount = 1;
  let currentRow = row;
  let currentCol = col;
  
  // Warnsdorff's algorithm - always choose the move with fewest onward moves
  while (moveCount < boardSize * boardSize) {
    const nextMove = findNextMove(currentRow, currentCol, visited, boardSize);
    
    // If no moves available, we're stuck
    if (!nextMove) break;
    
    // Make the move
    currentRow = nextMove.row;
    currentCol = nextMove.col;
    visited[currentRow][currentCol] = 1;
    tour.push({ row: currentRow, col: currentCol });
    moveCount++;
  }
  
  const found = moveCount === boardSize * boardSize;
  const endTime = performance.now();
  const executionTime = (endTime - startTime) / 1000; // Convert to seconds
  
  logger.info(`Warnsdorff's algorithm ${found ? 'found' : 'could not find'} solution in ${executionTime.toFixed(3)} seconds`);
  
  return {
    algorithm: 'warnsdorff',
    success: found,
    executionTime,
    iterations: moveCount,
    solution: found ? tour : [],
    boardSize
  };
}

/**
 * Find the next move using Warnsdorff's heuristic
 * @param {number} row - Current row
 * @param {number} col - Current column
 * @param {Array<Array<number>>} visited - Board with visited positions
 * @param {number} size - Board size
 * @returns {Object|null} - Next position or null if no moves available
 */
function findNextMove(row, col, visited, size) {
  let minDegree = Infinity;
  let nextMove = null;
  
  // Try all possible moves
  for (const [rowDiff, colDiff] of knightMoves) {
    const newRow = row + rowDiff;
    const newCol = col + colDiff;
    
    // If this is a valid unvisited square
    if (isValidPosition(newRow, newCol, visited, size)) {
      // Count the number of unvisited neighbors (degree)
      const degree = countUnvisitedNeighbors(newRow, newCol, visited, size);
      
      // Choose the move with minimum degree (fewest onward moves)
      if (degree < minDegree) {
        minDegree = degree;
        nextMove = { row: newRow, col: newCol };
      }
    }
  }
  
  return nextMove;
}

/**
 * Count unvisited neighbors of a position
 * @param {number} row - Row to check
 * @param {number} col - Column to check
 * @param {Array<Array<number>>} visited - Board with visited positions
 * @param {number} size - Board size
 * @returns {number} - Count of unvisited neighbors
 */
function countUnvisitedNeighbors(row, col, visited, size) {
  let count = 0;
  for (const [rowDiff, colDiff] of knightMoves) {
    const newRow = row + rowDiff;
    const newCol = col + colDiff;
    if (isValidPosition(newRow, newCol, visited, size)) {
      count++;
    }
  }
  return count;
}

/**
 * Save performance metrics to database
 * @param {Object} game - Game instance
 * @param {string} algorithm - Algorithm name
 * @param {Object} result - Algorithm result
 * @returns {Promise<void>}
 */
export async function savePerformanceMetrics(game, algorithm, result) {
  if (!game.gameId) return;
  
  try {
    await trackAlgorithmPerformance({
      gameId: game.gameId,
      algorithmName: algorithm,
      executionTime: result.executionTime,
      solutionFound: result.success,
      iterations: result.iterations,
      parameters: {
        boardSize: result.boardSize,
        startPosition: `${game.toAlgebraicNotation(game.startPosition.row, game.startPosition.col)}`
      }
    });
    
    logger.info(`Performance metrics saved for ${algorithm} algorithm`);
  } catch (error) {
    logger.error(`Failed to save performance metrics: ${error.message}`);
  }
}
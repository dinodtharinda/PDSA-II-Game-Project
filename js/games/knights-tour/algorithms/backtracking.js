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
 * Find a knight's tour using backtracking
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
  visited[row][col] = 1;
  tour.push({ row, col });
  
  // Backtracking algorithm
  const found = await solveKnightsTour(row, col, 2, visited, tour, boardSize);
  
  const endTime = performance.now();
  const executionTime = endTime - startTime; // Keep in milliseconds for consistency
  
  console.log(`Backtracking algorithm ${found ? 'found' : 'could not find'} solution in ${executionTime.toFixed(3)} ms`);
  
  return {
    algorithm: 'backtracking',
    success: found,
    executionTime,
    iterations: tour.length,
    solution: found ? tour : [],
    boardSize
  };
}

/**
 * Recursive backtracking function to solve knight's tour
 * @param {number} row - Current row position
 * @param {number} col - Current column position
 * @param {number} moveNum - Current move number
 * @param {Array<Array<number>>} visited - Board with visited positions
 * @param {Array<Object>} tour - Current tour path
 * @param {number} size - Board size
 * @returns {boolean} True if tour is found
 */
async function solveKnightsTour(row, col, moveNum, visited, tour, size) {
  // Base case: if all squares are visited
  if (moveNum > size * size) {
    return true;
  }
  
  // Try all possible moves from current position
  for (const [rowDiff, colDiff] of getOrderedMoves(row, col, visited, size)) {
    const newRow = row + rowDiff;
    const newCol = col + colDiff;
    
    // If this is a valid unvisited square
    if (isValidPosition(newRow, newCol, visited, size)) {
      // Mark as visited
      visited[newRow][newCol] = moveNum;
      tour.push({ row: newRow, col: newCol });
      
      // Recursively try this path
      if (await solveKnightsTour(newRow, newCol, moveNum + 1, visited, tour, size)) {
        return true;
      }
      
      // Backtrack
      visited[newRow][newCol] = 0;
      tour.pop();
    }
  }
  
  return false;
}

/**
 * Get ordered moves based on Warnsdorff's heuristic (fewest onward moves first)
 * @param {number} row - Current row
 * @param {number} col - Current column
 * @param {Array<Array<number>>} visited - Board with visited positions
 * @param {number} size - Board size
 * @returns {Array<Array<number>>} - Ordered moves
 */
function getOrderedMoves(row, col, visited, size) {
  const moves = [];
  
  for (const [rowDiff, colDiff] of knightMoves) {
    const newRow = row + rowDiff;
    const newCol = col + colDiff;
    
    if (isValidPosition(newRow, newCol, visited, size)) {
      const accessibilityScore = countUnvisitedNeighbors(newRow, newCol, visited, size);
      moves.push({ rowDiff, colDiff, accessibilityScore });
    }
  }
  
  // Sort moves by accessibility score (fewer accessible neighbors first)
  moves.sort((a, b) => a.accessibilityScore - b.accessibilityScore);
  
  // Return just the move deltas
  return moves.map(move => [move.rowDiff, move.colDiff]);
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
 * Save performance metrics to database via API
 * @param {Object} game - Game instance
 * @param {string} algorithm - Algorithm name
 * @param {Object} result - Algorithm result
 * @returns {Promise<void>}
 */
export async function savePerformanceMetrics(game, algorithm, result) {
  if (!game.gameId) return;
  
  try {
    // Instead of directly using server-side code, this would be handled by the API service
    // This function will be called by the game.js after importing the algorithm
    return {
      success: true,
      message: 'Performance metrics ready to be saved via API'
    };
  } catch (error) {
    console.error(`Failed to prepare performance metrics: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}
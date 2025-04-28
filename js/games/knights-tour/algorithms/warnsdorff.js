/**
 * Warnsdorff's algorithm for solving the Knight's Tour problem
 * Uses a heuristic to select the next move with fewest onward moves
 * 
 * @param {Object} options - Options for the algorithm
 * @param {Object} options.startPosition - Starting position {row, col}
 * @param {number} options.boardSize - Size of the board
 * @returns {Object} Solution object with path, execution time, etc.
 */
export default async function warnsdorff({ startPosition, boardSize }) {
  // Use high-resolution timing
  const startTime = performance.now();
  
  // Initialize board with -1 (unvisited)
  const board = Array(boardSize).fill().map(() => Array(boardSize).fill(-1));
  
  // Knight's move pattern (8 possible moves)
  const moveX = [2, 1, -1, -2, -2, -1, 1, 2];
  const moveY = [1, 2, 2, 1, -1, -2, -2, -1];
  
  // Place knight at starting position (mark as visited with move #0)
  const { row: startX, col: startY } = startPosition;
  board[startX][startY] = 0;
  
  // Build solution path
  const solution = [{ row: startX, col: startY }];
  
  // Try to solve the knight's tour
  const success = solveKT(board, 1, startX, startY, solution, moveX, moveY, boardSize);
  
  // Calculate execution time directly and ensure it's not zero
  const executionTime = Math.max(0.001, performance.now() - startTime);
  
  console.log(`Warnsdorff's algorithm ${success ? 'found' : 'failed to find'} solution in ${executionTime.toFixed(3)} ms`);
  
  return {
    algorithm: 'warnsdorff',
    success,
    executionTime,
    solution: success ? solution : [],
    boardSize
  };
}

/**
 * Helper function to check if a cell is valid and unvisited
 * 
 * @param {number} x - Row coordinate
 * @param {number} y - Column coordinate
 * @param {Array<Array<number>>} board - Chess board
 * @param {number} n - Board size
 * @returns {boolean} Whether the cell is valid
 */
function isSafe(x, y, board, n) {
  return (x >= 0 && x < n && y >= 0 && y < n && board[x][y] === -1);
}

/**
 * Calculate the degree of a cell (number of unvisited neighbors)
 * 
 * @param {number} x - Row coordinate
 * @param {number} y - Column coordinate
 * @param {Array<Array<number>>} board - Chess board
 * @param {Array<number>} moveX - X-coordinate moves
 * @param {Array<number>} moveY - Y-coordinate moves 
 * @param {number} n - Board size
 * @returns {number} Degree of the cell (number of unvisited neighbors)
 */
function getDegree(x, y, board, moveX, moveY, n) {
  let count = 0;
  for (let i = 0; i < 8; i++) {
    if (isSafe(x + moveX[i], y + moveY[i], board, n)) {
      count++;
    }
  }
  return count;
}

/**
 * Solve Knight's Tour using Warnsdorff's algorithm
 * 
 * @param {Array<Array<number>>} board - Chess board
 * @param {number} moveCount - Current move count
 * @param {number} x - Current row
 * @param {number} y - Current column
 * @param {Array<Object>} solution - Solution path
 * @param {Array<number>} moveX - X-coordinate moves
 * @param {Array<number>} moveY - Y-coordinate moves
 * @param {number} n - Board size
 * @returns {boolean} Whether the tour is completed
 */
function solveKT(board, moveCount, x, y, solution, moveX, moveY, n) {
  // If all squares are visited, the tour is complete
  if (moveCount === n * n) {
    return true;
  }
  
  // Try all next moves using Warnsdorff's heuristic
  let nextMoves = [];
  
  // Calculate the degree for all possible next moves
  for (let i = 0; i < 8; i++) {
    const nextX = x + moveX[i];
    const nextY = y + moveY[i];
    
    if (isSafe(nextX, nextY, board, n)) {
      const degree = getDegree(nextX, nextY, board, moveX, moveY, n);
      nextMoves.push({ x: nextX, y: nextY, degree });
    }
  }
  
  // Sort next moves by degree (ascending) - pick move with fewest onward moves first
  nextMoves.sort((a, b) => a.degree - b.degree);
  
  // Try each next move in order of increasing degree
  for (const move of nextMoves) {
    const nextX = move.x;
    const nextY = move.y;
    
    // Make the move
    board[nextX][nextY] = moveCount;
    solution.push({ row: nextX, col: nextY });
    
    // Recursively try to complete the tour from this new position
    if (solveKT(board, moveCount + 1, nextX, nextY, solution, moveX, moveY, n)) {
      return true;
    }
    
    // Backtrack if the move doesn't lead to a solution
    board[nextX][nextY] = -1;
    solution.pop();
  }
  
  return false;
}
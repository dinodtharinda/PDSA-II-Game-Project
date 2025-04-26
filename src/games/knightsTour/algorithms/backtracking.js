import logger from '../../../utils/logger.js';

const knightMoves = [
  [-2, -1], [-2, 1], [-1, -2], [-1, 2],
  [1, -2], [1, 2], [2, -1], [2, 1]
];

export function solveTourBacktracking(board, startPos) {
  const size = board.length;
  const visited = Array(size).fill().map(() => Array(size).fill(false));
  const solution = [startPos];
  visited[startPos.row][startPos.col] = true;

  if (findTour(startPos.row, startPos.col, 1, visited, solution, size)) {
    return solution;
  }
  return [];
}

function findTour(row, col, moveCount, visited, solution, size) {
  if (moveCount === size * size) {
    return true;
  }

  const nextMoves = getValidMoves(row, col, visited, size);
  for (const move of nextMoves) {
    visited[move.row][move.col] = true;
    solution.push(move);

    if (findTour(move.row, move.col, moveCount + 1, visited, solution, size)) {
      return true;
    }

    visited[move.row][move.col] = false;
    solution.pop();
  }

  return false;
}

function getValidMoves(row, col, visited, size) {
  const moves = [];
  
  for (const [rowDiff, colDiff] of knightMoves) {
    const newRow = row + rowDiff;
    const newCol = col + colDiff;
    
    if (isValidPosition(newRow, newCol, visited, size)) {
      moves.push({
        row: newRow,
        col: newCol,
        accessibility: countUnvisitedNeighbors(newRow, newCol, visited, size)
      });
    }
  }

  // Sort moves by accessibility (Warnsdorff's heuristic)
  moves.sort((a, b) => a.accessibility - b.accessibility);
  return moves;
}

function isValidPosition(row, col, visited, size) {
  return row >= 0 && row < size && 
         col >= 0 && col < size && 
         !visited[row][col];
}

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

export async function savePerformanceMetrics(game, algorithm, solution, executionTime) {
  if (!game.gameId) return;
  
  try {
    // Create move sequence string from solution
    const moveSequence = solution.map(
      move => game.toAlgebraicNotation(move.row, move.col)
    ).join(',');
    
    // Update game record
    await game.saveAlgorithmSolution(algorithm, solution, executionTime);
    
    logger.info(`Performance metrics saved for ${algorithm} algorithm`);
  } catch (error) {
    logger.error(`Failed to save performance metrics: ${error.message}`);
  }
}
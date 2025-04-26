import logger from '../../../utils/logger.js';

const knightMoves = [
  [-2, -1], [-2, 1], [-1, -2], [-1, 2],
  [1, -2], [1, 2], [2, -1], [2, 1]
];

export function solveTourWarnsdorff(board, startPos) {
  const size = board.length;
  const visited = Array(size).fill().map(() => Array(size).fill(false));
  const solution = [startPos];
  let currentPos = { ...startPos };
  visited[startPos.row][startPos.col] = true;
  let moveCount = 1;

  while (moveCount < size * size) {
    const nextMove = findNextMove(currentPos.row, currentPos.col, visited, size);
    if (!nextMove) {
      break; // No solution found
    }

    visited[nextMove.row][nextMove.col] = true;
    solution.push(nextMove);
    currentPos = nextMove;
    moveCount++;
  }

  return moveCount === size * size ? solution : [];
}

function findNextMove(row, col, visited, size) {
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
  
  if (moves.length === 0) {
    return null;
  }
  
  // Sort by accessibility (fewer unvisited neighbors first)
  moves.sort((a, b) => a.accessibility - b.accessibility);
  return moves[0];
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
    await game.saveAlgorithmSolution(algorithm, solution, executionTime);
    logger.info(`Performance metrics saved for ${algorithm} algorithm`);
  } catch (error) {
    logger.error(`Failed to save performance metrics: ${error.message}`);
  }
}
/**
 * Minimax Algorithm with Alpha-Beta Pruning for Tic Tac Toe
 * Optimizes computer move selection on a 5x5 board
 */

/**
 * Find the best move using minimax with alpha-beta pruning
 * @param {Array} board - 2D array representing current board state
 * @param {string} player - Current player ('X' or 'O')
 * @param {number} depth - Current depth in the search tree
 * @param {number} maxDepth - Maximum depth to search
 * @returns {Object} Best move with row and column
 */
export function findBestMove(board, player = 'O', depth = 0, maxDepth = 3) {
    // For 5x5 board, we limit depth to prevent excessive calculation
    // Adjust maxDepth based on performance testing
    
    let bestMove = { row: -1, col: -1, score: player === 'O' ? -Infinity : Infinity };
    const opponent = player === 'O' ? 'X' : 'O';
  
    // Find all available moves
    const availableMoves = [];
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        if (board[i][j] === null) {
          availableMoves.push({ row: i, col: j });
        }
      }
    }
  
    // If no moves or reached max depth, evaluate board
    if (availableMoves.length === 0 || depth >= maxDepth) {
      const score = evaluateBoard(board, 'O');
      return { row: -1, col: -1, score: score };
    }
  
    // Try each available move
    for (const move of availableMoves) {
      // Make the move
      board[move.row][move.col] = player;
      
      // Calculate score for this move
      const score = minimax(board, opponent, depth + 1, -Infinity, Infinity, maxDepth);
      
      // Undo the move
      board[move.row][move.col] = null;
      
      // Update best move if needed
      if (player === 'O' && score > bestMove.score) {
        bestMove = { row: move.row, col: move.col, score: score };
      } else if (player === 'X' && score < bestMove.score) {
        bestMove = { row: move.row, col: move.col, score: score };
      }
    }
  
    return bestMove;
  }
  
  /**
   * Minimax algorithm with alpha-beta pruning
   * @param {Array} board - 2D array representing current board state
   * @param {string} player - Current player ('X' or 'O')
   * @param {number} depth - Current depth in the search tree
   * @param {number} alpha - Alpha value for pruning
   * @param {number} beta - Beta value for pruning
   * @param {number} maxDepth - Maximum depth to search
   * @returns {number} Score for the current board state
   */
  function minimax(board, player, depth, alpha, beta, maxDepth) {
    // Check for terminal states
    const winner = checkWinner(board);
    if (winner === 'O') return 100 - depth; // Computer wins (subtract depth to prefer quicker wins)
    if (winner === 'X') return -100 + depth; // Human wins
    if (isBoardFull(board) || depth >= maxDepth) return evaluateBoard(board, 'O'); // Draw or max depth
  
    const opponent = player === 'O' ? 'X' : 'O';
    
    if (player === 'O') { // Maximizing player (computer)
      let maxScore = -Infinity;
      
      for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
          if (board[i][j] === null) {
            board[i][j] = player;
            const score = minimax(board, opponent, depth + 1, alpha, beta, maxDepth);
            board[i][j] = null; // Undo move
            maxScore = Math.max(maxScore, score);
            alpha = Math.max(alpha, score);
            if (beta <= alpha) break; // Alpha-beta pruning
          }
        }
      }
      
      return maxScore;
    } else { // Minimizing player (human)
      let minScore = Infinity;
      
      for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
          if (board[i][j] === null) {
            board[i][j] = player;
            const score = minimax(board, opponent, depth + 1, alpha, beta, maxDepth);
            board[i][j] = null; // Undo move
            minScore = Math.min(minScore, score);
            beta = Math.min(beta, score);
            if (beta <= alpha) break; // Alpha-beta pruning
          }
        }
      }
      
      return minScore;
    }
  }
  
  /**
   * Evaluate the current board state
   * @param {Array} board - 2D array representing current board state
   * @param {string} player - Current player ('X' or 'O')
   * @returns {number} Score for the current board state
   */
  function evaluateBoard(board, player) {
    const opponent = player === 'O' ? 'X' : 'O';
    let score = 0;
    
    // Evaluate rows, columns, and diagonals
    // For 5x5, check for potential win conditions with 4 in a row
    
    // Score rows
    score += evaluateLines(board, player, opponent, true);
    
    // Score columns
    score += evaluateLines(board, player, opponent, false);
    
    // Score diagonals
    score += evaluateDiagonals(board, player, opponent);
    
    return score;
  }
  
  /**
   * Evaluate rows or columns
   * @param {Array} board - 2D array representing current board state
   * @param {string} player - Player to evaluate for ('X' or 'O')
   * @param {string} opponent - Opponent player
   * @param {boolean} isRow - If true, evaluate rows; otherwise, columns
   * @returns {number} Score for rows or columns
   */
  function evaluateLines(board, player, opponent, isRow) {
    let score = 0;
    const size = board.length;
    
    // Loop through each row or column
    for (let i = 0; i < size; i++) {
      // Count consecutive marks in this line
      let playerMarks = 0;
      let opponentMarks = 0;
      let emptySpaces = 0;
      
      for (let j = 0; j < size; j++) {
        const cell = isRow ? board[i][j] : board[j][i];
        
        if (cell === player) playerMarks++;
        else if (cell === opponent) opponentMarks++;
        else emptySpaces++;
      }
      
      // Only one player has marks in this line (or it's empty)
      if (playerMarks > 0 && opponentMarks === 0) {
        // For 5x5 board, 4 in a row is a win condition
        if (playerMarks === 4) score += 100;
        else if (playerMarks === 3) score += 10;
        else if (playerMarks === 2) score += 1;
      } else if (opponentMarks > 0 && playerMarks === 0) {
        if (opponentMarks === 4) score -= 100;
        else if (opponentMarks === 3) score -= 10;
        else if (opponentMarks === 2) score -= 1;
      }
    }
    
    return score;
  }
  
  /**
   * Evaluate diagonals
   * @param {Array} board - 2D array representing current board state
   * @param {string} player - Player to evaluate for ('X' or 'O')
   * @param {string} opponent - Opponent player
   * @returns {number} Score for diagonals
   */
  function evaluateDiagonals(board, player, opponent) {
    let score = 0;
    const size = board.length;
    
    // Check main diagonals and potential 4-in-a-row diagonals
    for (let startRow = 0; startRow <= size - 4; startRow++) {
      for (let startCol = 0; startCol <= size - 4; startCol++) {
        // Check diagonal from top-left to bottom-right
        let playerMarks1 = 0;
        let opponentMarks1 = 0;
        let emptySpaces1 = 0;
        
        // Check diagonal from top-right to bottom-left
        let playerMarks2 = 0;
        let opponentMarks2 = 0;
        let emptySpaces2 = 0;
        
        for (let i = 0; i < 4; i++) {
          const cell1 = board[startRow + i][startCol + i];
          if (cell1 === player) playerMarks1++;
          else if (cell1 === opponent) opponentMarks1++;
          else emptySpaces1++;
          
          const cell2 = board[startRow + i][startCol + 3 - i];
          if (cell2 === player) playerMarks2++;
          else if (cell2 === opponent) opponentMarks2++;
          else emptySpaces2++;
        }
        
        // Score these diagonal sections
        if (playerMarks1 > 0 && opponentMarks1 === 0) {
          if (playerMarks1 === 4) score += 100;
          else if (playerMarks1 === 3) score += 10;
          else if (playerMarks1 === 2) score += 1;
        } else if (opponentMarks1 > 0 && playerMarks1 === 0) {
          if (opponentMarks1 === 4) score -= 100;
          else if (opponentMarks1 === 3) score -= 10;
          else if (opponentMarks1 === 2) score -= 1;
        }
        
        if (playerMarks2 > 0 && opponentMarks2 === 0) {
          if (playerMarks2 === 4) score += 100;
          else if (playerMarks2 === 3) score += 10;
          else if (playerMarks2 === 2) score += 1;
        } else if (opponentMarks2 > 0 && playerMarks2 === 0) {
          if (opponentMarks2 === 4) score -= 100;
          else if (opponentMarks2 === 3) score -= 10;
          else if (opponentMarks2 === 2) score -= 1;
        }
      }
    }
    
    return score;
  }
  
  /**
   * Check if the board is full
   * @param {Array} board - 2D array representing current board state
   * @returns {boolean} True if board is full, false otherwise
   */
  function isBoardFull(board) {
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        if (board[i][j] === null) {
          return false;
        }
      }
    }
    return true;
  }
  
  /**
   * Check if there is a winner
   * @param {Array} board - 2D array representing current board state
   * @returns {string|null} Winner ('X' or 'O') or null if no winner
   */
  function checkWinner(board) {
    const size = board.length;
    
    // Check rows for win (4-in-a-row for 5x5 board)
    for (let i = 0; i < size; i++) {
      for (let j = 0; j <= size - 4; j++) {
        if (board[i][j] !== null &&
            board[i][j] === board[i][j+1] &&
            board[i][j] === board[i][j+2] &&
            board[i][j] === board[i][j+3]) {
          return board[i][j];
        }
      }
    }
    
    // Check columns for win
    for (let i = 0; i <= size - 4; i++) {
      for (let j = 0; j < size; j++) {
        if (board[i][j] !== null &&
            board[i][j] === board[i+1][j] &&
            board[i][j] === board[i+2][j] &&
            board[i][j] === board[i+3][j]) {
          return board[i][j];
        }
      }
    }
    
    // Check diagonals (top-left to bottom-right)
    for (let i = 0; i <= size - 4; i++) {
      for (let j = 0; j <= size - 4; j++) {
        if (board[i][j] !== null &&
            board[i][j] === board[i+1][j+1] &&
            board[i][j] === board[i+2][j+2] &&
            board[i][j] === board[i+3][j+3]) {
          return board[i][j];
        }
      }
    }
    
    // Check diagonals (top-right to bottom-left)
    for (let i = 0; i <= size - 4; i++) {
      for (let j = size - 1; j >= 3; j--) {
        if (board[i][j] !== null &&
            board[i][j] === board[i+1][j-1] &&
            board[i][j] === board[i+2][j-2] &&
            board[i][j] === board[i+3][j-3]) {
          return board[i][j];
        }
      }
    }
    
    return null;
  }
  
  export default {
    findBestMove,
    evaluateBoard
  };
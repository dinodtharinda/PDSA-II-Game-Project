/**
 * Monte Carlo Tree Search (MCTS) Algorithm for Tic Tac Toe
 * Provides an alternative approach to Minimax for computer move selection
 */

/**
 * Find the best move using Monte Carlo Tree Search
 * @param {Array} board - 2D array representing current board state
 * @param {string} player - Current player ('X' or 'O')
 * @param {number} iterations - Number of simulations to run (higher = better but slower)
 * @returns {Object} Best move with row and column
 */
export function findBestMove(board, player = 'O', iterations = 1000) {
  // Create root node from current board state
  const rootNode = new Node(null, null, board, player);
  
  // Run MCTS for specified number of iterations
  for (let i = 0; i < iterations; i++) {
    // 1. Selection: Select the most promising node
    let currentNode = rootNode;
    while (!currentNode.isTerminal() && currentNode.isFullyExpanded()) {
      currentNode = currentNode.selectBestChild();
    }
    
    // 2. Expansion: Expand the selected node if possible
    if (!currentNode.isTerminal()) {
      currentNode = currentNode.expand();
    }
    
    // 3. Simulation: Run a random simulation from the expanded node
    const simulationResult = currentNode.simulate();
    
    // 4. Backpropagation: Update the node and all its ancestors with the result
    currentNode.backpropagate(simulationResult);
  }
  
  // Return the move with the highest visit count (most reliable)
  const bestChild = rootNode.getBestChild();
  return bestChild ? bestChild.move : null;
}

/**
 * Node class for MCTS tree
 */
class Node {
  /**
   * Create a new Node in the MCTS tree
   * @param {Node|null} parent - Parent node
   * @param {Object|null} move - Move that led to this node (row, col)
   * @param {Array} board - 2D array representing current board state
   * @param {string} player - Current player ('X' or 'O')
   */
  constructor(parent, move, board, player) {
    this.parent = parent;
    this.move = move;
    this.board = JSON.parse(JSON.stringify(board)); // Deep copy
    this.player = player; // Player to move from this state
    this.children = [];
    this.visits = 0;
    this.wins = 0;
    
    // If a move was provided, apply it to the board
    if (move) {
      const prevPlayer = player === 'X' ? 'O' : 'X';
      this.board[move.row][move.col] = prevPlayer;
    }
  }
  
  /**
   * Check if this node represents a terminal state (win, loss, or draw)
   * @returns {boolean} True if terminal, false otherwise
   */
  isTerminal() {
    return checkWinner(this.board) !== null || isBoardFull(this.board);
  }
  
  /**
   * Check if all possible child nodes have been expanded
   * @returns {boolean} True if fully expanded, false otherwise
   */
  isFullyExpanded() {
    // Get all available moves
    const availableMoves = this.getAvailableMoves();
    
    // If all available moves have been tried (all child nodes created)
    return availableMoves.length === 0 || availableMoves.length === this.children.length;
  }
  
  /**
   * Get all available moves from this board state
   * @returns {Array} Array of available moves {row, col}
   */
  getAvailableMoves() {
    const moves = [];
    const size = this.board.length;
    
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (this.board[i][j] === null) {
          moves.push({ row: i, col: j });
        }
      }
    }
    
    return moves;
  }
  
  /**
   * Expand this node by creating a random untried child node
   * @returns {Node} Newly created child node
   */
  expand() {
    // Get all available moves
    const availableMoves = this.getAvailableMoves();
    
    // Filter out moves that already have child nodes
    const untriedMoves = availableMoves.filter(move => {
      return !this.children.some(child => 
        child.move.row === move.row && child.move.col === move.col
      );
    });
    
    // Create a child node for a random untried move
    const moveIndex = Math.floor(Math.random() * untriedMoves.length);
    const move = untriedMoves[moveIndex];
    const nextPlayer = this.player === 'X' ? 'O' : 'X';
    
    const childNode = new Node(this, move, this.board, nextPlayer);
    this.children.push(childNode);
    return childNode;
  }
  
  /**
   * Select the best child node according to UCT formula
   * @returns {Node} Best child node
   */
  selectBestChild() {
    const explorationParameter = 1.414; // Square root of 2
    
    let bestChild = null;
    let bestValue = -Infinity;
    
    for (const child of this.children) {
      // UCT formula: wins/visits + C * sqrt(ln(parent_visits) / visits)
      const exploitation = child.wins / child.visits;
      const exploration = explorationParameter * Math.sqrt(Math.log(this.visits) / child.visits);
      const value = exploitation + exploration;
      
      if (value > bestValue) {
        bestValue = value;
        bestChild = child;
      }
    }
    
    return bestChild;
  }
  
  /**
   * Get the best child node based on visit count
   * @returns {Node} Best child node
   */
  getBestChild() {
    let bestChild = null;
    let mostVisits = -Infinity;
    
    for (const child of this.children) {
      if (child.visits > mostVisits) {
        mostVisits = child.visits;
        bestChild = child;
      }
    }
    
    return bestChild;
  }
  
  /**
   * Run a random simulation from this node until a terminal state
   * @returns {number} Result of simulation (1 for 'O' win, -1 for 'X' win, 0 for draw)
   */
  simulate() {
    // Make a copy of the board for simulation
    const simulationBoard = JSON.parse(JSON.stringify(this.board));
    let currentPlayer = this.player;
    
    // Simulate random moves until terminal state
    while (true) {
      // Check if the game is over
      const winner = checkWinner(simulationBoard);
      if (winner === 'O') return 1;  // 'O' wins
      if (winner === 'X') return -1; // 'X' wins
      if (isBoardFull(simulationBoard)) return 0; // Draw
      
      // Get all available moves
      const availableMoves = [];
      const size = simulationBoard.length;
      
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          if (simulationBoard[i][j] === null) {
            availableMoves.push({ row: i, col: j });
          }
        }
      }
      
      // Make a random move
      const moveIndex = Math.floor(Math.random() * availableMoves.length);
      const move = availableMoves[moveIndex];
      simulationBoard[move.row][move.col] = currentPlayer;
      
      // Switch players
      currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    }
  }
  
  /**
   * Backpropagate the simulation result through the tree
   * @param {number} result - Result of simulation (1 for 'O' win, -1 for 'X' win, 0 for draw)
   */
  backpropagate(result) {
    let current = this;
    
    while (current !== null) {
      current.visits++;
      
      // Update wins differently based on perspective
      // From 'O' perspective: wins increment on 'O' win (result = 1)
      // From 'X' perspective: wins increment on 'X' win (result = -1)
      if ((current.player === 'X' && result === -1) || 
          (current.player === 'O' && result === 1)) {
        current.wins++;
      }
      // For draws (result = 0), we could add a partial win (0.5) if desired
      else if (result === 0) {
        current.wins += 0.5;
      }
      
      current = current.parent;
    }
  }
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
  findBestMove
};
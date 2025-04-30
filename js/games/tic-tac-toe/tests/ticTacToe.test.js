// Unit tests for Tic-Tac-Toe Game
import { TicTacToe } from '../game.js';

// Simple test runner
class TestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  addTest(name, testFn) {
    this.tests.push({ name, testFn });
  }

  async runTests() {
    console.log('Running Tic-Tac-Toe tests...');
    console.log('=================');

    for (const test of this.tests) {
      try {
        await test.testFn();
        console.log(`✅ PASS: ${test.name}`);
        this.passed++;
      } catch (error) {
        console.error(`❌ FAIL: ${test.name}`);
        console.error(`   Error: ${error.message}`);
        this.failed++;
      }
    }

    console.log('=================');
    console.log(`Results: ${this.passed} passed, ${this.failed} failed`);
    return { passed: this.passed, failed: this.failed };
  }
}

// Create a helper function to assert conditions
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
}

// Test function
async function runTicTacToeTests() {
  const testRunner = new TestRunner();
  
  // Setup a mock Tic-Tac-Toe game for testing
  function createMockGame() {
    // Mock API to prevent database calls during tests
    jest.mock('../services/api.js', () => ({
      createTicTacToeGame: async () => ({ success: true, gameId: 'test-123' }),
      saveTicTacToePerformance: async () => ({ success: true }),
      endTicTacToeGame: async () => ({ success: true })
    }));

    const game = new TicTacToe({
      boardSize: 5,
      algorithmType: 'minimax',
      onBoardUpdate: () => {},
      onGameOver: () => {},
      onAlgorithmPerformance: () => {}
    });
    
    // Override database methods to prevent actual API calls
    game.init = () => { game.gameId = 'test-123'; };
    game.endGame = () => {};
    
    return game;
  }

  // Test game initialization
  testRunner.addTest('should initialize with a 5x5 empty board', () => {
    const game = createMockGame();
    assert(game.board.length === 5, `Expected board size 5, got ${game.board.length}`);
    
    // Check all cells are null
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        assert(game.board[i][j] === null, `Expected cell (${i},${j}) to be null, got ${game.board[i][j]}`);
      }
    }
  });

  // Test board size configuration
  testRunner.addTest('should initialize with configured board size', () => {
    const game = new TicTacToe({ boardSize: 3 });
    assert(game.board.length === 3, `Expected board size 3, got ${game.board.length}`);
    
    for (let i = 0; i < 3; i++) {
      assert(game.board[i].length === 3, `Expected row ${i} to have length 3, got ${game.board[i].length}`);
    }
  });

  // Test player move
  testRunner.addTest('should correctly apply player moves', () => {
    const game = createMockGame();
    const result = game.makePlayerMove(2, 2);
    
    assert(result === true, 'Expected makePlayerMove to return true');
    assert(game.board[2][2] === 'X', `Expected cell (2,2) to be 'X', got ${game.board[2][2]}`);
    assert(game.moves.length === 1, `Expected 1 move, got ${game.moves.length}`);
    assert(game.moves[0].player === 'X', `Expected player 'X', got ${game.moves[0].player}`);
  });
  
  // Test invalid move rejection
  testRunner.addTest('should reject invalid moves', () => {
    const game = createMockGame();
    
    // Make a valid move first
    game.makePlayerMove(2, 2);
    
    // Try to move to the same spot
    const result = game.makePlayerMove(2, 2);
    assert(result === false, 'Expected makePlayerMove to return false for occupied cell');
    
    // Try to move out of bounds
    const outOfBoundsResult = game.makePlayerMove(5, 5);
    assert(outOfBoundsResult === false, 'Expected makePlayerMove to return false for out-of-bounds move');
  });
  
  // Test board full detection
  testRunner.addTest('should correctly detect a full board', () => {
    const game = createMockGame();
    
    // Board should not be full initially
    assert(game.isBoardFull() === false, 'Expected empty board to not be full');
    
    // Fill the board with moves
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        game.board[i][j] = (i + j) % 2 === 0 ? 'X' : 'O';
      }
    }
    
    assert(game.isBoardFull() === true, 'Expected filled board to be full');
  });
  
  // Test horizontal win detection
  testRunner.addTest('should detect horizontal wins', () => {
    const game = createMockGame();
    
    // No winner on empty board
    assert(game.checkWinner() === null, 'Expected no winner on empty board');
    
    // Create a horizontal win for X
    game.board[1][0] = 'X';
    game.board[1][1] = 'X';
    game.board[1][2] = 'X';
    game.board[1][3] = 'X';
    
    assert(game.checkWinner() === 'X', 'Expected X to win with horizontal line');
  });
  
  // Test vertical win detection
  testRunner.addTest('should detect vertical wins', () => {
    const game = createMockGame();
    
    // Create a vertical win for O
    game.board[0][2] = 'O';
    game.board[1][2] = 'O';
    game.board[2][2] = 'O';
    game.board[3][2] = 'O';
    
    assert(game.checkWinner() === 'O', 'Expected O to win with vertical line');
  });
  
  // Test diagonal win detection (top-left to bottom-right)
  testRunner.addTest('should detect diagonal wins (top-left to bottom-right)', () => {
    const game = createMockGame();
    
    // Create a diagonal win for X
    game.board[0][0] = 'X';
    game.board[1][1] = 'X';
    game.board[2][2] = 'X';
    game.board[3][3] = 'X';
    
    assert(game.checkWinner() === 'X', 'Expected X to win with diagonal line (top-left to bottom-right)');
  });
  
  // Test diagonal win detection (top-right to bottom-left)
  testRunner.addTest('should detect diagonal wins (top-right to bottom-left)', () => {
    const game = createMockGame();
    
    // Create a diagonal win for O
    game.board[0][4] = 'O';
    game.board[1][3] = 'O';
    game.board[2][2] = 'O';
    game.board[3][1] = 'O';
    
    assert(game.checkWinner() === 'O', 'Expected O to win with diagonal line (top-right to bottom-left)');
  });
  
  // Test game reset
  testRunner.addTest('should reset the game properly', () => {
    const game = createMockGame();
    
    // Make some moves
    game.makePlayerMove(2, 2);
    game.board[1][1] = 'O'; // Directly set a computer move
    
    // Reset the game
    game.reset();
    
    // Check if the board is empty
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        assert(game.board[i][j] === null, `Expected cell (${i},${j}) to be null after reset`);
      }
    }
    
    assert(game.currentPlayer === 'X', "Expected current player to be 'X' after reset");
    assert(game.gameOver === false, "Expected gameOver to be false after reset");
    assert(game.moves.length === 0, "Expected no moves after reset");
  });
  
  // Test algorithm switching
  testRunner.addTest('should change algorithm correctly', () => {
    const game = createMockGame();
    assert(game.algorithmType === 'minimax', "Expected default algorithm to be 'minimax'");
    
    game.setAlgorithm('mcts');
    assert(game.algorithmType === 'mcts', "Expected algorithm to be 'mcts' after change");
    
    // Test invalid algorithm type
    game.setAlgorithm('invalid');
    assert(game.algorithmType === 'mcts', "Expected algorithm to remain 'mcts' after invalid input");
  });

  // Run the tests
  return await testRunner.runTests();
}

// Execute tests when this file is loaded
runTicTacToeTests().then(results => {
  console.log(`Tic-Tac-Toe test execution complete: ${results.passed} passed, ${results.failed} failed`);
}).catch(error => {
  console.error('Error running Tic-Tac-Toe tests:', error);
});

// Export the test function for potential reuse
export default runTicTacToeTests;
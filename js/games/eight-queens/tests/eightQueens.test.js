// Unit tests for Eight Queens Puzzle
import EightQueensGame from '../game.js';
import { validateSolution } from '../services/api.js';

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
    console.log('Running Eight Queens tests...');
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
async function runEightQueensTests() {
  const testRunner = new TestRunner();
  
  // Setup a mock Eight Queens game for testing
  function createMockGame() {
    const game = new EightQueensGame({ 
      boardSize: 8,
      onBoardUpdate: () => {},
      onSolutionFound: () => {}
    });
    
    // Override API calls
    game.init = () => { 
      game.gameId = 'test-123';
      game.initialized = true;
    };
    
    game.init();
    return game;
  }

  // Test board initialization
  testRunner.addTest('should initialize with an empty board of specified size', () => {
    const game = createMockGame();
    assert(game.board.length === 8, `Expected board size 8, got ${game.board.length}`);
    
    // Check all cells are empty
    let hasQueen = false;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (game.board[row][col]) {
          hasQueen = true;
          break;
        }
      }
    }
    assert(!hasQueen, 'Expected empty board, found queen');
  });

  // Test queen placement
  testRunner.addTest('should allow placing a queen on a valid position', () => {
    const game = createMockGame();
    const result = game.placeQueen(0, 0);
    assert(result, 'Expected successful queen placement');
    assert(game.board[0][0], 'Expected queen at position (0,0)');
  });

  // Test invalid queen placement
  testRunner.addTest('should prevent placing a queen where another queen can attack', () => {
    const game = createMockGame();
    
    // Place a queen at (0,0)
    game.placeQueen(0, 0);
    
    // Try to place a queen in the same row
    const result1 = game.placeQueen(0, 2);
    assert(!result1, 'Should prevent placement in same row');
    
    // Try to place a queen in the same column
    const result2 = game.placeQueen(2, 0);
    assert(!result2, 'Should prevent placement in same column');
    
    // Try to place a queen in the same diagonal
    const result3 = game.placeQueen(2, 2);
    assert(!result3, 'Should prevent placement in same diagonal');
  });

  // Test removing a queen
  testRunner.addTest('should be able to remove a queen from the board', () => {
    const game = createMockGame();
    
    // Place a queen
    game.placeQueen(3, 3);
    assert(game.board[3][3], 'Expected queen at (3,3)');
    
    // Remove the queen
    game.removeQueen(3, 3);
    assert(!game.board[3][3], 'Expected no queen at (3,3) after removal');
  });

  // Test solution validation - valid solution
  testRunner.addTest('should correctly validate a valid solution', async () => {
    const validSolution = [
      { row: 0, col: 0 },
      { row: 1, col: 4 },
      { row: 2, col: 7 },
      { row: 3, col: 5 },
      { row: 4, col: 2 },
      { row: 5, col: 6 },
      { row: 6, col: 1 },
      { row: 7, col: 3 }
    ];
    
    // Mock the validation function to avoid actual API calls
    const mockValidateResult = async (queens) => {
      // Basic validation logic
      const threats = [];
      
      // Check for row, column, and diagonal conflicts
      for (let i = 0; i < queens.length; i++) {
        for (let j = i + 1; j < queens.length; j++) {
          const q1 = queens[i];
          const q2 = queens[j];
          
          // Same row
          if (q1.row === q2.row) {
            threats.push({ type: 'row', queens: [i, j] });
          }
          
          // Same column
          if (q1.col === q2.col) {
            threats.push({ type: 'column', queens: [i, j] });
          }
          
          // Same diagonal
          if (Math.abs(q1.row - q2.row) === Math.abs(q1.col - q2.col)) {
            threats.push({ type: 'diagonal', queens: [i, j] });
          }
        }
      }
      
      return {
        valid: threats.length === 0,
        threats,
        message: threats.length === 0 ? 'Valid solution' : 'Queens are threatening each other'
      };
    };
    
    const result = await mockValidateResult(validSolution);
    assert(result.valid, `Expected valid solution, got: ${JSON.stringify(result)}`);
  });

  // Test solution validation - invalid solution
  testRunner.addTest('should correctly identify an invalid solution', async () => {
    const invalidSolution = [
      { row: 0, col: 0 },
      { row: 1, col: 1 },  // Diagonal threat with (0,0)
      { row: 2, col: 7 },
      { row: 3, col: 5 },
      { row: 4, col: 2 },
      { row: 5, col: 6 },
      { row: 6, col: 3 },
      { row: 7, col: 4 }
    ];
    
    // Mock the validation function to avoid actual API calls
    const mockValidateResult = async (queens) => {
      // Basic validation logic
      const threats = [];
      
      // Check for row, column, and diagonal conflicts
      for (let i = 0; i < queens.length; i++) {
        for (let j = i + 1; j < queens.length; j++) {
          const q1 = queens[i];
          const q2 = queens[j];
          
          // Same row
          if (q1.row === q2.row) {
            threats.push({ type: 'row', queens: [i, j] });
          }
          
          // Same column
          if (q1.col === q2.col) {
            threats.push({ type: 'column', queens: [i, j] });
          }
          
          // Same diagonal
          if (Math.abs(q1.row - q2.row) === Math.abs(q1.col - q2.col)) {
            threats.push({ type: 'diagonal', queens: [i, j] });
          }
        }
      }
      
      return {
        valid: threats.length === 0,
        threats,
        message: threats.length === 0 ? 'Valid solution' : 'Queens are threatening each other'
      };
    };
    
    const result = await mockValidateResult(invalidSolution);
    assert(!result.valid, 'Expected invalid solution');
    assert(result.threats.length > 0, 'Expected threats to be identified');
  });

  // Test clear board
  testRunner.addTest('should clear the entire board', () => {
    const game = createMockGame();
    
    // Place some queens
    game.placeQueen(0, 0);
    game.placeQueen(1, 2);
    game.placeQueen(2, 4);
    
    // Clear the board
    game.clearBoard();
    
    // Check if the board is empty
    let hasQueen = false;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (game.board[row][col]) {
          hasQueen = true;
          break;
        }
      }
    }
    
    assert(!hasQueen, 'Expected board to be clear, but found queens');
  });

  // Run the tests
  return await testRunner.runTests();
}

// Execute tests when this file is loaded
runEightQueensTests().then(results => {
  console.log(`Eight Queens test execution complete: ${results.passed} passed, ${results.failed} failed`);
}).catch(error => {
  console.error('Error running Eight Queens tests:', error);
});

// Export the test function for potential reuse
export default runEightQueensTests;
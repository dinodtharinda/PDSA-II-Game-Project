// Unit tests for TSP (Traveling Salesman Problem) Game
import TSPGame from '../game.js';

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
    console.log('Running tests...');
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
async function runTSPTests() {
  const testRunner = new TestRunner();
  
  // Setup a mock TSP game for testing
  function createMockTSPGame() {
    const game = new TSPGame();
    game.cities = ['A', 'B', 'C', 'D'];
    game.distances = [
      [0, 10, 15, 20],   // A to others
      [10, 0, 35, 25],   // B to others
      [15, 35, 0, 30],   // C to others
      [20, 25, 30, 0]    // D to others
    ];
    game.homeCity = 'A';
    game.userPath = ['A', 'B', 'C', 'D', 'A']; // Default user path
    return game;
  }

  // Test calculateDistance method
  testRunner.addTest('calculateDistance should return 0 for empty path', () => {
    const game = createMockTSPGame();
    const distance = game.calculateDistance([]);
    assert(distance === 0, `Expected 0, got ${distance}`);
  });

  testRunner.addTest('calculateDistance should return 0 for single city', () => {
    const game = createMockTSPGame();
    const distance = game.calculateDistance(['A']);
    assert(distance === 0, `Expected 0, got ${distance}`);
  });

  testRunner.addTest('calculateDistance should calculate correct distance for valid path', () => {
    const game = createMockTSPGame();
    const path = ['A', 'B', 'C', 'D'];
    // Expected distance: A→B(10) + B→C(35) + C→D(30) = 75
    const expected = 75;
    const distance = game.calculateDistance(path);
    assert(distance === expected, `Expected ${expected}, got ${distance}`);
  });

  testRunner.addTest('calculateDistance should calculate correct round trip distance', () => {
    const game = createMockTSPGame();
    const path = ['A', 'B', 'C', 'D', 'A'];
    // Expected distance: A→B(10) + B→C(35) + C→D(30) + D→A(20) = 95
    const expected = 95;
    const distance = game.calculateDistance(path);
    assert(distance === expected, `Expected ${expected}, got ${distance}`);
  });

  testRunner.addTest('calculateDistance should throw error for invalid city', () => {
    const game = createMockTSPGame();
    try {
      game.calculateDistance(['A', 'E', 'C']);
      assert(false, 'Should have thrown an error for invalid city');
    } catch (error) {
      assert(error.message.includes('Invalid city'), `Unexpected error: ${error.message}`);
    }
  });

  // Test validateUserSolution method
  testRunner.addTest('validateUserSolution should detect if all cities are visited', () => {
    const game = createMockTSPGame();
    game.userPath = ['A', 'B', 'C', 'A']; // Missing city D
    const result = game.validateUserSolution();
    assert(!result.valid, 'Should be invalid when not all cities are visited');
    assert(result.reason === 'notAllCitiesVisited', `Expected notAllCitiesVisited, got ${result.reason}`);
  });

  testRunner.addTest('validateUserSolution should require starting from home city', () => {
    const game = createMockTSPGame();
    game.userPath = ['B', 'A', 'C', 'D', 'A']; // Doesn't start at home city A
    const result = game.validateUserSolution();
    assert(!result.valid, 'Should be invalid when not starting from home city');
    assert(result.reason === 'doesNotStartAtHome', `Expected doesNotStartAtHome, got ${result.reason}`);
  });

  testRunner.addTest('validateUserSolution should require ending at home city', () => {
    const game = createMockTSPGame();
    game.userPath = ['A', 'B', 'C', 'D']; // Doesn't end at home city A
    const result = game.validateUserSolution();
    assert(!result.valid, 'Should be invalid when not ending at home city');
    assert(result.reason === 'doesNotEndAtHome', `Expected doesNotEndAtHome, got ${result.reason}`);
  });

  testRunner.addTest('validateUserSolution should detect duplicated cities', () => {
    const game = createMockTSPGame();
    game.userPath = ['A', 'B', 'C', 'B', 'D', 'A']; // B appears twice
    const result = game.validateUserSolution();
    assert(!result.valid, 'Should be invalid when cities are visited more than once');
    assert(result.reason === 'duplicatedCities', `Expected duplicatedCities, got ${result.reason}`);
  });

  testRunner.addTest('validateUserSolution should accept valid solution', () => {
    const game = createMockTSPGame();
    game.userPath = ['A', 'B', 'C', 'D', 'A']; // Valid path
    const result = game.validateUserSolution();
    assert(result.valid, 'Should be valid for a correct path');
    assert(result.totalDistance === 95, `Expected distance 95, got ${result.totalDistance}`);
  });

  // Run the tests
  return await testRunner.runTests();
}

// Execute tests when this file is loaded
runTSPTests().then(results => {
  console.log(`Test execution complete: ${results.passed} passed, ${results.failed} failed`);
}).catch(error => {
  console.error('Error running tests:', error);
});

// Export the test function for potential reuse
export default runTSPTests;
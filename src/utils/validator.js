/**
 * Utility for validating input data
 */
class Validator {
  /**
   * Validate that a value is present
   * @param {*} value - Value to check
   * @param {string} fieldName - Name of the field for error message
   * @throws {Error} If validation fails
   */
  static required(value, fieldName) {
    if (value === undefined || value === null || value === '') {
      throw new Error(`${fieldName} is required`);
    }
  }

  /**
   * Validate that a value is a number
   * @param {*} value - Value to check
   * @param {string} fieldName - Name of the field for error message
   * @throws {Error} If validation fails
   */
  static isNumber(value, fieldName) {
    if (isNaN(Number(value))) {
      throw new Error(`${fieldName} must be a number`);
    }
  }

  /**
   * Validate that a value is an integer
   * @param {*} value - Value to check
   * @param {string} fieldName - Name of the field for error message
   * @throws {Error} If validation fails
   */
  static isInteger(value, fieldName) {
    if (!Number.isInteger(Number(value))) {
      throw new Error(`${fieldName} must be an integer`);
    }
  }

  /**
   * Validate that a value is within a range
   * @param {number} value - Value to check
   * @param {number} min - Minimum allowed value
   * @param {number} max - Maximum allowed value
   * @param {string} fieldName - Name of the field for error message
   * @throws {Error} If validation fails
   */
  static inRange(value, min, max, fieldName) {
    const numValue = Number(value);
    if (numValue < min || numValue > max) {
      throw new Error(`${fieldName} must be between ${min} and ${max}`);
    }
  }

  /**
   * Validate that a value matches a pattern
   * @param {string} value - Value to check
   * @param {RegExp} pattern - Regular expression to match against
   * @param {string} fieldName - Name of the field for error message
   * @throws {Error} If validation fails
   */
  static matches(value, pattern, fieldName) {
    if (!pattern.test(value)) {
      throw new Error(`${fieldName} has an invalid format`);
    }
  }

  /**
   * Validate that a value is one of a set of allowed values
   * @param {*} value - Value to check
   * @param {Array} allowedValues - Array of allowed values
   * @param {string} fieldName - Name of the field for error message
   * @throws {Error} If validation fails
   */
  static oneOf(value, allowedValues, fieldName) {
    if (!allowedValues.includes(value)) {
      throw new Error(`${fieldName} must be one of: ${allowedValues.join(', ')}`);
    }
  }

  /**
   * Validate that a value is a valid chess position (e.g., "a1", "h8")
   * @param {string} position - Chess position to validate
   * @param {string} fieldName - Name of the field for error message
   * @throws {Error} If validation fails
   */
  static isChessPosition(position, fieldName) {
    const pattern = /^[a-h][1-8]$/;
    if (!pattern.test(position)) {
      throw new Error(`${fieldName} must be a valid chess position (e.g., "a1", "h8")`);
    }
  }

  /**
   * Validate a game-specific move
   * @param {string} gameType - Type of game
   * @param {*} move - Move to validate
   * @throws {Error} If validation fails
   */
  static validateGameMove(gameType, move) {
    switch (gameType) {
      case 'ticTacToe':
        this.validateTicTacToeMove(move);
        break;
      case 'tsp':
        this.validateTspRoute(move);
        break;
      case 'towerOfHanoi':
        this.validateHanoiMove(move);
        break;
      case 'eightQueens':
        this.validateQueensPlacement(move);
        break;
      case 'knightsTour':
        this.validateKnightMove(move);
        break;
      default:
        throw new Error(`Unknown game type: ${gameType}`);
    }
  }

  /**
   * Validate a Tic-Tac-Toe move
   * @param {Object} move - Move to validate
   * @throws {Error} If validation fails
   */
  static validateTicTacToeMove(move) {
    this.required(move, 'Move');
    this.required(move.row, 'Row');
    this.required(move.col, 'Column');
    this.isInteger(move.row, 'Row');
    this.isInteger(move.col, 'Column');
    this.inRange(move.row, 0, 4, 'Row'); // 5x5 grid
    this.inRange(move.col, 0, 4, 'Column'); // 5x5 grid
  }

  /**
   * Validate a Tower of Hanoi move
   * @param {Object} move - Move to validate
   * @throws {Error} If validation fails
   */
  static validateHanoiMove(move) {
    this.required(move, 'Move');
    this.required(move.fromPeg, 'Source peg');
    this.required(move.toPeg, 'Destination peg');
    this.isInteger(move.fromPeg, 'Source peg');
    this.isInteger(move.toPeg, 'Destination peg');
    
    const pegCount = move.pegCount || 3;
    this.inRange(move.fromPeg, 1, pegCount, 'Source peg');
    this.inRange(move.toPeg, 1, pegCount, 'Destination peg');
    
    if (move.fromPeg === move.toPeg) {
      throw new Error('Source and destination pegs cannot be the same');
    }
  }

  /**
   * Validate an Eight Queens placement
   * @param {Array} placements - Array of queen placements
   * @throws {Error} If validation fails
   */
  static validateQueensPlacement(placements) {
    this.required(placements, 'Queen placements');
    if (!Array.isArray(placements)) {
      throw new Error('Queen placements must be an array');
    }
    
    if (placements.length !== 8) {
      throw new Error('There must be exactly 8 queens');
    }
    
    // Check for unique positions
    const positions = new Set();
    placements.forEach((pos, index) => {
      this.isChessPosition(pos, `Queen ${index + 1} position`);
      if (positions.has(pos)) {
        throw new Error(`Duplicate position: ${pos}`);
      }
      positions.add(pos);
    });
    
    // Check for attacking queens
    this.validateNoQueenAttacks(placements);
  }

  /**
   * Check that no queens are attacking each other
   * @param {Array} placements - Array of queen placements (e.g., ["a1", "b3", ...])
   * @throws {Error} If queens can attack each other
   */
  static validateNoQueenAttacks(placements) {
    // Convert chess notation to row/col coordinates
    const queens = placements.map(pos => {
      const col = pos.charCodeAt(0) - 'a'.charCodeAt(0);
      const row = 8 - parseInt(pos[1]);
      return { row, col };
    });
    
    // Check for queens in same row, column, or diagonal
    for (let i = 0; i < queens.length; i++) {
      for (let j = i + 1; j < queens.length; j++) {
        const q1 = queens[i];
        const q2 = queens[j];
        
        // Same row
        if (q1.row === q2.row) {
          throw new Error(`Queens at ${placements[i]} and ${placements[j]} share the same row`);
        }
        
        // Same column
        if (q1.col === q2.col) {
          throw new Error(`Queens at ${placements[i]} and ${placements[j]} share the same column`);
        }
        
        // Same diagonal
        if (Math.abs(q1.row - q2.row) === Math.abs(q1.col - q2.col)) {
          throw new Error(`Queens at ${placements[i]} and ${placements[j]} share the same diagonal`);
        }
      }
    }
  }

  /**
   * Validate a Knight's Tour move
   * @param {Object} move - Move to validate
   * @throws {Error} If validation fails
   */
  static validateKnightMove(move) {
    this.required(move, 'Move');
    this.required(move.from, 'Starting position');
    this.required(move.to, 'Ending position');
    
    this.isChessPosition(move.from, 'Starting position');
    this.isChessPosition(move.to, 'Ending position');
    
    // Check that the move is a valid knight's move
    const fromCol = move.from.charCodeAt(0) - 'a'.charCodeAt(0);
    const fromRow = parseInt(move.from[1]) - 1;
    const toCol = move.to.charCodeAt(0) - 'a'.charCodeAt(0);
    const toRow = parseInt(move.to[1]) - 1;
    
    const colDiff = Math.abs(fromCol - toCol);
    const rowDiff = Math.abs(fromRow - toRow);
    
    if (!((colDiff === 1 && rowDiff === 2) || (colDiff === 2 && rowDiff === 1))) {
      throw new Error(`Invalid knight move from ${move.from} to ${move.to}`);
    }
  }

  /**
   * Validate a TSP route
   * @param {Object} route - Route to validate
   * @throws {Error} If validation fails
   */
  static validateTspRoute(route) {
    this.required(route, 'Route');
    this.required(route.cities, 'Cities');
    
    if (!Array.isArray(route.cities)) {
      throw new Error('Cities must be an array');
    }
    
    if (route.cities.length < 2) {
      throw new Error('Route must include at least 2 cities');
    }
    
    const citySet = new Set(route.cities);
    if (citySet.size !== route.cities.length) {
      throw new Error('Route cannot visit the same city more than once');
    }
    
    // Validate city names (assuming cities are labeled A through J)
    const validCities = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    route.cities.forEach(city => {
      if (!validCities.includes(city)) {
        throw new Error(`Invalid city: ${city}`);
      }
    });
  }
}

module.exports = Validator;
import logger from './logger.js';

class Validator {
  static required(value, fieldName) {
    if (value === undefined || value === null || value === '') {
      throw new Error(`${fieldName} is required`);
    }
    return true;
  }

  static isNumber(value, fieldName) {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new Error(`${fieldName} must be a valid number`);
    }
    return true;
  }

  static isInteger(value, fieldName) {
    if (!Number.isInteger(value)) {
      throw new Error(`${fieldName} must be an integer`);
    }
    return true;
  }

  static inRange(value, min, max, fieldName) {
    this.isNumber(value, fieldName);
    if (value < min || value > max) {
      throw new Error(`${fieldName} must be between ${min} and ${max}`);
    }
    return true;
  }

  static matches(value, pattern, fieldName) {
    if (!pattern.test(value)) {
      throw new Error(`${fieldName} has an invalid format`);
    }
    return true;
  }

  static oneOf(value, allowedValues, fieldName) {
    if (!allowedValues.includes(value)) {
      throw new Error(`${fieldName} must be one of: ${allowedValues.join(', ')}`);
    }
    return true;
  }

  static validateGameMove(gameType, move, gameState) {
    try {
      switch (gameType) {
        case 'ticTacToe':
          return this.validateTicTacToeMove(move, gameState);
        case 'towerOfHanoi':
          return this.validateHanoiMove(move, gameState);
        case 'eightQueens':
          return this.validateQueensPlacement(move, gameState);
        case 'knightsTour':
          return this.validateKnightMove(move, gameState);
        case 'tsp':
          return this.validateTspRoute(move.route, gameState.cities);
        default:
          throw new Error(`Unknown game type: ${gameType}`);
      }
    } catch (error) {
      logger.error('Game move validation failed:', {
        gameType,
        move,
        error: error.message
      });
      throw error;
    }
  }

  static validateTicTacToeMove(move, gameState) {
    if (!move || typeof move.row !== 'number' || typeof move.col !== 'number') {
      throw new Error('Invalid move format');
    }
    if (move.row < 0 || move.row >= 5 || move.col < 0 || move.col >= 5) {
      throw new Error('Move out of bounds');
    }
    if (gameState.board[move.row][move.col] !== null) {
      throw new Error('Cell is already occupied');
    }
    return true;
  }

  static validateHanoiMove(move, gameState) {
    const { fromPeg, toPeg } = move;
    if (fromPeg < 0 || fromPeg >= gameState.pegCount || toPeg < 0 || toPeg >= gameState.pegCount) {
      throw new Error('Invalid peg index');
    }
    if (fromPeg === toPeg) {
      throw new Error('Source and destination pegs must be different');
    }
    if (gameState.pegs[fromPeg].length === 0) {
      throw new Error('Source peg is empty');
    }
    if (gameState.pegs[toPeg].length > 0 && 
        gameState.pegs[fromPeg][gameState.pegs[fromPeg].length - 1] > 
        gameState.pegs[toPeg][gameState.pegs[toPeg].length - 1]) {
      throw new Error('Cannot place a larger disk on a smaller one');
    }
    return true;
  }

  static validateQueensPlacement(position, gameState) {
    if (!this.isChessPosition(position)) {
      throw new Error('Invalid chess position format');
    }
    
    const { row, col } = this.algebraicToIndices(position);
    if (gameState.board[row][col]) {
      throw new Error('Position already occupied');
    }
    
    return true;
  }

  static validateKnightMove(move, gameState) {
    const { row, col } = move;
    const currentPos = gameState.currentPosition;
    
    if (!currentPos) {
      throw new Error('No current position set');
    }
    
    const rowDiff = Math.abs(row - currentPos.row);
    const colDiff = Math.abs(col - currentPos.col);
    
    if (!((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2))) {
      throw new Error('Invalid knight move');
    }
    
    if (gameState.board[row][col] !== null) {
      throw new Error('Position already visited');
    }
    
    return true;
  }

  static validateTspRoute(route, cities) {
    if (!Array.isArray(route)) {
      throw new Error('Route must be an array');
    }
    
    const uniqueCities = new Set(route);
    if (uniqueCities.size !== cities.length) {
      throw new Error('Route must visit each city exactly once');
    }
    
    if (!cities.every(city => route.includes(city))) {
      throw new Error('Route must include all cities');
    }
    
    return true;
  }

  static isChessPosition(position) {
    if (typeof position !== 'string') return false;
    return /^[a-h][1-8]$/.test(position);
  }

  static algebraicToIndices(position) {
    const col = position.charCodeAt(0) - 'a'.charCodeAt(0);
    const row = 8 - parseInt(position[1], 10);
    return { row, col };
  }
}

export default Validator;
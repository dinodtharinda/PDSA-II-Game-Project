import Timer from '../utils/timer.js';

export default class BaseGame {
  constructor(playerId) {
    this.playerId = playerId;
    this.timer = new Timer();
    this.moveCount = 0;
    this.gameState = 'initialized';
    this.winner = null;
  }

  async initialize() {
    this.gameState = 'in_progress';
    this.timer.start();
    console.log(`BaseGame initialized for player ${this.playerId}`);
  }

  async makeMove(move) {
    if (this.gameState !== 'in_progress') {
      throw new Error('Game is not in progress');
    }

    if (!this.validateMove(move)) {
      throw new Error('Invalid move');
    }

    await this.applyMove(move);
    this.moveCount++;

    if (this.checkWin()) {
      await this.endGame('win');
    } else if (this.checkDraw()) {
      await this.endGame('draw');
    }

    return {
      gameState: this.gameState,
      winner: this.winner,
      moveCount: this.moveCount,
      elapsedTime: this.timer.getDurationInSeconds()
    };
  }

  async endGame(result) {
    this.gameState = 'completed';
    this.winner = result;
    const duration = this.timer.stop();
    console.log(`BaseGame ended for player ${this.playerId} with result: ${result} in ${duration}ms`);
  }

  // Methods to be implemented by specific games
  validateMove(move) {
    throw new Error('validateMove must be implemented by specific game');
  }

  async applyMove(move) {
    throw new Error('applyMove must be implemented by specific game');
  }

  checkWin() {
    throw new Error('checkWin must be implemented by specific game');
  }

  checkDraw() {
    throw new Error('checkDraw must be implemented by specific game');
  }

  getGameState() {
    return {
      playerId: this.playerId,
      gameState: this.gameState,
      moveCount: this.moveCount,
      winner: this.winner,
      elapsedTime: this.timer.getElapsedTimeMs()
    };
  }

  resetGame() {
    this.moveCount = 0;
    this.gameState = 'initialized';
    this.winner = null;
    this.timer.reset();
  }
}
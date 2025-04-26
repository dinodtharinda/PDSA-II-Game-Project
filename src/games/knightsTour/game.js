import BaseGame from '../BaseGame.js';
import Timer from '../../utils/timer.js';
import logger from '../../utils/logger.js';
import { getSequelize } from '../../config/db.js';

export default class KnightsTour extends BaseGame {
  constructor(size = 8, playerId = null) {
    super(playerId);
    this.size = size;
    this.board = this.createEmptyBoard();
    this.currentPosition = null;
    this.startPosition = null;
    this.moveSequence = [];
    this.isGameActive = true;
    this.gameId = null;
    this.timer = new Timer();
  }

  createEmptyBoard() {
    return Array(this.size).fill().map(() => Array(this.size).fill(null));
  }

  async initializeGame(startPos = null) {
    this.board = this.createEmptyBoard();
    this.moveSequence = [];
    this.isGameActive = true;
    this.timer.start();
    
    if (!startPos) {
      startPos = {
        row: Math.floor(Math.random() * this.size),
        col: Math.floor(Math.random() * this.size)
      };
    }
    
    this.startPosition = { ...startPos };
    this.currentPosition = { ...startPos };
    this.board[startPos.row][startPos.col] = 1;
    this.moveSequence.push({ row: startPos.row, col: startPos.col });
    
    if (this.playerId) {
      await this.createGameRecord();
    }
    
    return this.startPosition;
  }

  async createGameRecord() {
    try {
      const db = await getSequelize();
      const result = await db.query(
        'INSERT INTO games (game_type, player_id) VALUES (?, ?)',
        ['knightsTour', this.playerId]
      );
      
      this.gameId = result.insertId;
      logger.info(`Created new Knight's Tour game with ID: ${this.gameId}`);
    } catch (error) {
      logger.error(`Error creating Knight's Tour game record: ${error.message}`);
    }
  }

  isValidMove(row, col) {
    if (row < 0 || row >= this.size || col < 0 || col >= this.size) {
      return false;
    }
    
    if (this.board[row][col] !== null) {
      return false;
    }
    
    const currentRow = this.currentPosition.row;
    const currentCol = this.currentPosition.col;
    
    const rowDiff = Math.abs(row - currentRow);
    const colDiff = Math.abs(col - currentCol);
    
    return (rowDiff === 1 && colDiff === 2) || (rowDiff === 2 && colDiff === 1);
  }

  makeMove(row, col) {
    if (!this.isGameActive) {
      return false;
    }
    
    if (!this.isValidMove(row, col)) {
      if (this.getValidMoves().length === 0) {
        this.isGameActive = false;
        logger.info('Knight is trapped! No valid moves available.');
      }
      return false;
    }
    
    const moveNumber = this.moveSequence.length + 1;
    this.board[row][col] = moveNumber;
    this.currentPosition = { row, col };
    this.moveSequence.push({ row, col });
    
    if (moveNumber === this.size * this.size) {
      this.isGameActive = false;
      this.saveCompletedTour();
      return true;
    }
    
    if (this.getValidMoves().length === 0) {
      this.isGameActive = false;
      logger.info('Knight is trapped! No valid moves available.');
    }
    
    return true;
  }

  getValidMoves() {
    const moves = [];
    const knightMoves = [
      { rowDiff: -2, colDiff: -1 }, { rowDiff: -2, colDiff: 1 },
      { rowDiff: -1, colDiff: -2 }, { rowDiff: -1, colDiff: 2 },
      { rowDiff: 1, colDiff: -2 }, { rowDiff: 1, colDiff: 2 },
      { rowDiff: 2, colDiff: -1 }, { rowDiff: 2, colDiff: 1 }
    ];
    
    const { row, col } = this.currentPosition;
    
    for (const move of knightMoves) {
      const newRow = row + move.rowDiff;
      const newCol = col + move.colDiff;
      
      if (this.isValidMove(newRow, newCol)) {
        moves.push({ row: newRow, col: newCol });
      }
    }
    
    return moves;
  }

  toAlgebraicNotation(row, col) {
    const colLetter = String.fromCharCode(97 + col);
    const rowNumber = this.size - row;
    return `${colLetter}${rowNumber}`;
  }

  fromAlgebraicNotation(notation) {
    if (!notation || notation.length !== 2) {
      return null;
    }
    
    const col = notation.charCodeAt(0) - 97;
    const row = this.size - parseInt(notation[1], 10);
    
    if (row < 0 || row >= this.size || col < 0 || col >= this.size) {
      return null;
    }
    
    return { row, col };
  }

  async saveCompletedTour() {
    if (!this.gameId) return;
    
    try {
      this.timer.stop();
      
      const moveSequence = this.moveSequence.map(
        move => this.toAlgebraicNotation(move.row, move.col)
      ).join(',');
      
      const db = await getSequelize();
      await db.query(
        'UPDATE games SET result = ?, end_time = CURRENT_TIMESTAMP WHERE id = ?',
        ['completed', this.gameId]
      );
      
      await db.query(
        'INSERT INTO knights_tour (game_id, start_position, move_sequence, algorithm_type, execution_time) VALUES (?, ?, ?, ?, ?)',
        [
          this.gameId,
          this.toAlgebraicNotation(this.startPosition.row, this.startPosition.col),
          moveSequence,
          'manual',
          this.timer.getDurationInSeconds()
        ]
      );
      
      logger.info(`Saved completed Knight's Tour for game ID: ${this.gameId}`);
    } catch (error) {
      logger.error(`Error saving Knight's Tour: ${error.message}`);
    }
  }

  async saveAlgorithmSolution(algorithm, solution, executionTime) {
    if (!this.gameId) return;
    
    try {
      const moveSequence = solution.map(
        move => this.toAlgebraicNotation(move.row, move.col)
      ).join(',');
      
      const db = await getSequelize();
      await db.query(
        'UPDATE games SET result = ?, end_time = CURRENT_TIMESTAMP WHERE id = ?',
        ['algorithmSolved', this.gameId]
      );
      
      await db.query(
        'INSERT INTO knights_tour (game_id, start_position, move_sequence, algorithm_type, execution_time) VALUES (?, ?, ?, ?, ?)',
        [
          this.gameId,
          this.toAlgebraicNotation(this.startPosition.row, this.startPosition.col),
          moveSequence,
          algorithm,
          executionTime
        ]
      );
      
      logger.info(`Saved ${algorithm} solution for Knight's Tour game ID: ${this.gameId}`);
    } catch (error) {
      logger.error(`Error saving algorithm solution: ${error.message}`);
    }
  }

  reset() {
    this.board = this.createEmptyBoard();
    this.currentPosition = null;
    this.startPosition = null;
    this.moveSequence = [];
    this.isGameActive = true;
    this.timer = new Timer();
  }

  getGameState() {
    return {
      board: this.board.map(row => [...row]),
      currentPosition: this.currentPosition ? { ...this.currentPosition } : null,
      startPosition: this.startPosition ? { ...this.startPosition } : null,
      moveCount: this.moveSequence.length,
      movesHistory: [...this.moveSequence],
      isGameActive: this.isGameActive,
      validMoves: this.getValidMoves()
    };
  }
}
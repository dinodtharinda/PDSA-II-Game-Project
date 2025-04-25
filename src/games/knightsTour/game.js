/**
 * Knight's Tour Game
 * This module implements the Knight's Tour game logic with database integration
 */
const db = require('../../config/db');
const logger = require('../../utils/logger');
const Timer = require('../../utils/timer');

class KnightsTour {
    constructor(size = 8) {
        this.size = size;
        this.board = this.createEmptyBoard();
        this.currentPosition = null;
        this.startPosition = null;
        this.moveSequence = [];
        this.isGameActive = true;
        this.gameId = null;
        this.timer = new Timer();
    }

    /**
     * Create empty chess board
     * @returns {Array} 2D array representing the chess board
     */
    createEmptyBoard() {
        const board = [];
        for (let i = 0; i < this.size; i++) {
            board[i] = new Array(this.size).fill(null);
        }
        return board;
    }

    /**
     * Initialize new game with random or specified start position
     * @param {Object} startPos - Starting position {row, col}
     * @param {number} playerId - Player ID for database
     * @returns {Object} Start position
     */
    async initializeGame(startPos = null, playerId = null) {
        this.board = this.createEmptyBoard();
        this.moveSequence = [];
        this.isGameActive = true;
        this.timer.start();
        
        // Generate random start position if not provided
        if (!startPos) {
            startPos = {
                row: Math.floor(Math.random() * this.size),
                col: Math.floor(Math.random() * this.size)
            };
        }
        
        // Set the starting position
        this.startPosition = { ...startPos };
        this.currentPosition = { ...startPos };
        
        // Mark starting position on board (1 for first move)
        this.board[startPos.row][startPos.col] = 1;
        this.moveSequence.push({ row: startPos.row, col: startPos.col });
        
        // Create game record in database
        await this.createGameRecord(playerId);
        
        return this.startPosition;
    }

    /**
     * Create game record in database
     * @param {number} playerId - Player ID
     */
    async createGameRecord(playerId) {
        try {
            // Create game record
            const result = await db.query(
                'INSERT INTO games (game_type, player_id) VALUES (?, ?)',
                ['knightsTour', playerId]
            );
            
            this.gameId = result.insertId;
            logger.info(`Created new Knight's Tour game with ID: ${this.gameId}`);
        } catch (error) {
            logger.error(`Error creating Knight's Tour game record: ${error.message}`);
        }
    }

    /**
     * Check if a move is valid
     * @param {number} row - Target row
     * @param {number} col - Target column
     * @returns {boolean} Whether the move is valid
     */
    isValidMove(row, col) {
        // Check if position is within board boundaries
        if (row < 0 || row >= this.size || col < 0 || col >= this.size) {
            return false;
        }
        
        // Check if position is already visited
        if (this.board[row][col] !== null) {
            return false;
        }
        
        // Check if it's a valid knight move
        const currentRow = this.currentPosition.row;
        const currentCol = this.currentPosition.col;
        
        const rowDiff = Math.abs(row - currentRow);
        const colDiff = Math.abs(col - currentCol);
        
        return (rowDiff === 1 && colDiff === 2) || (rowDiff === 2 && colDiff === 1);
    }

    /**
     * Make a move on the board
     * @param {number} row - Target row
     * @param {number} col - Target column
     * @returns {boolean} Whether the move was successful
     */
    makeMove(row, col) {
        if (!this.isGameActive) {
            return false;
        }
        
        if (!this.isValidMove(row, col)) {
            return false;
        }
        
        // Update board and current position
        const moveNumber = this.moveSequence.length + 1;
        this.board[row][col] = moveNumber;
        this.currentPosition = { row, col };
        this.moveSequence.push({ row, col });
        
        // Check if the tour is complete
        if (moveNumber === this.size * this.size) {
            this.isGameActive = false;
            this.saveCompletedTour();
            return true;
        }
        
        // Check if the knight is trapped (no more valid moves)
        if (this.getValidMoves().length === 0) {
            this.isGameActive = false;
            return true;
        }
        
        return true;
    }

    /**
     * Get all valid moves from current position
     * @returns {Array} Array of valid moves {row, col}
     */
    getValidMoves() {
        const moves = [];
        const knightMoves = [
            { rowDiff: -2, colDiff: -1 },
            { rowDiff: -2, colDiff: 1 },
            { rowDiff: -1, colDiff: -2 },
            { rowDiff: -1, colDiff: 2 },
            { rowDiff: 1, colDiff: -2 },
            { rowDiff: 1, colDiff: 2 },
            { rowDiff: 2, colDiff: -1 },
            { rowDiff: 2, colDiff: 1 }
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

    /**
     * Convert board position to algebraic notation (e.g. "e4")
     * @param {number} row - Row index
     * @param {number} col - Column index
     * @returns {string} Algebraic notation
     */
    toAlgebraicNotation(row, col) {
        const colLetter = String.fromCharCode(97 + col); // 'a' is ASCII 97
        const rowNumber = this.size - row; // Invert row number (8 for top row in chess)
        return `${colLetter}${rowNumber}`;
    }

    /**
     * Convert algebraic notation to board position
     * @param {string} notation - Algebraic notation (e.g. "e4")
     * @returns {Object|null} Position {row, col} or null if invalid
     */
    fromAlgebraicNotation(notation) {
        if (!notation || notation.length !== 2) {
            return null;
        }
        
        const col = notation.charCodeAt(0) - 97; // 'a' is ASCII 97
        const row = this.size - parseInt(notation[1], 10);
        
        if (row < 0 || row >= this.size || col < 0 || col >= this.size) {
            return null;
        }
        
        return { row, col };
    }

    /**
     * Save completed tour to database
     */
    async saveCompletedTour() {
        if (!this.gameId) return;
        
        try {
            // Stop timer and calculate duration
            this.timer.stop();
            
            // Create move sequence string
            const moveSequence = this.moveSequence.map(
                move => this.toAlgebraicNotation(move.row, move.col)
            ).join(',');
            
            // Update game record
            await db.query(
                'UPDATE games SET result = ?, end_time = CURRENT_TIMESTAMP WHERE id = ?',
                ['completed', this.gameId]
            );
            
            // Add tour record
            await db.query(
                'INSERT INTO knights_tour (game_id, start_position, move_sequence, algorithm_type, execution_time) VALUES (?, ?, ?, ?, ?)',
                [
                    this.gameId,
                    this.toAlgebraicNotation(this.startPosition.row, this.startPosition.col),
                    moveSequence,
                    'manual', // Manual player solution
                    this.timer.getDurationInSeconds()
                ]
            );
            
            logger.info(`Saved completed Knight's Tour for game ID: ${this.gameId}`);
        } catch (error) {
            logger.error(`Error saving Knight's Tour: ${error.message}`);
        }
    }

    /**
     * Save algorithmic solution to database
     * @param {string} algorithm - Algorithm name
     * @param {Array} solution - Solution path
     * @param {number} executionTime - Execution time in seconds
     */
    async saveAlgorithmSolution(algorithm, solution, executionTime) {
        if (!this.gameId) return;
        
        try {
            // Create move sequence string from solution
            const moveSequence = solution.map(
                move => this.toAlgebraicNotation(move.row, move.col)
            ).join(',');
            
            // Update game record
            await db.query(
                'UPDATE games SET result = ?, end_time = CURRENT_TIMESTAMP WHERE id = ?',
                ['algorithmSolved', this.gameId]
            );
            
            // Add tour record
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

    /**
     * Reset the game
     */
    reset() {
        this.board = this.createEmptyBoard();
        this.currentPosition = null;
        this.startPosition = null;
        this.moveSequence = [];
        this.isGameActive = true;
        this.timer = new Timer();
    }

    /**
     * Get current game state
     * @returns {Object} Game state
     */
    getGameState() {
        return {
            board: this.board.map(row => [...row]),
            currentPosition: { ...this.currentPosition },
            startPosition: { ...this.startPosition },
            moveCount: this.moveSequence.length,
            movesHistory: [...this.moveSequence],
            isGameActive: this.isGameActive,
            validMoves: this.getValidMoves()
        };
    }
}

module.exports = KnightsTour;
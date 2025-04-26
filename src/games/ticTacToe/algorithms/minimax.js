/**
 * Minimax Algorithm Implementation for 5×5 Tic Tac Toe
 * Uses alpha-beta pruning for optimization
 */

class Minimax {
    /**
     * Find the best move using minimax algorithm with alpha-beta pruning
     * @param {Array} board - Current game board
     * @param {number} depth - Maximum depth to search
     * @returns {Object} Best move {row, col, score}
     */
    static findBestMove(board) {
        let bestMove = { row: -1, col: -1, score: -Infinity };
        const depth = this.calculateSearchDepth(board);

        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                if (board[i][j] === null) {
                    board[i][j] = 'O';
                    const score = this.minimax(board, depth - 1, false, -Infinity, Infinity);
                    board[i][j] = null;

                    if (score > bestMove.score) {
                        bestMove = { row: i, col: j, score };
                    }
                }
            }
        }

        return bestMove;
    }

    /**
     * Calculate appropriate search depth based on number of empty cells
     * @param {Array} board - Current game board
     * @returns {number} Search depth
     */
    static calculateSearchDepth(board) {
        const emptyCells = board.flat().filter(cell => cell === null).length;
        // Adjust depth based on number of empty cells to manage computation time
        if (emptyCells > 20) return 3;
        if (emptyCells > 15) return 4;
        if (emptyCells > 10) return 5;
        return 6;
    }

    /**
     * Minimax algorithm with alpha-beta pruning
     * @param {Array} board - Current game board
     * @param {number} depth - Current depth
     * @param {boolean} isMaximizing - Whether current player is maximizing
     * @param {number} alpha - Alpha value for pruning
     * @param {number} beta - Beta value for pruning
     * @returns {number} Best score for the current board state
     */
    static minimax(board, depth, isMaximizing, alpha, beta) {
        // Terminal conditions
        const score = this.evaluateBoard(board);
        if (score !== null) return score;
        if (depth === 0) return this.heuristicScore(board);
        if (this.isBoardFull(board)) return 0;

        if (isMaximizing) {
            let maxScore = -Infinity;
            for (let i = 0; i < 5; i++) {
                for (let j = 0; j < 5; j++) {
                    if (board[i][j] === null) {
                        board[i][j] = 'O';
                        const score = this.minimax(board, depth - 1, false, alpha, beta);
                        board[i][j] = null;
                        maxScore = Math.max(maxScore, score);
                        alpha = Math.max(alpha, score);
                        if (beta <= alpha) break;
                    }
                }
            }
            return maxScore;
        } else {
            let minScore = Infinity;
            for (let i = 0; i < 5; i++) {
                for (let j = 0; j < 5; j++) {
                    if (board[i][j] === null) {
                        board[i][j] = 'X';
                        const score = this.minimax(board, depth - 1, true, alpha, beta);
                        board[i][j] = null;
                        minScore = Math.min(minScore, score);
                        beta = Math.min(beta, score);
                        if (beta <= alpha) break;
                    }
                }
            }
            return minScore;
        }
    }

    /**
     * Check if board is in a terminal state and return score
     * @param {Array} board - Current game board
     * @returns {number|null} Score if terminal state, null otherwise
     */
    static evaluateBoard(board) {
        // Check rows, columns and diagonals for win
        // Return 100 for O win, -100 for X win, null if game not over
        const lines = this.getAllLines(board);
        
        for (const line of lines) {
            const consecutive = this.getConsecutiveCount(line);
            if (consecutive.player === 'O' && consecutive.count >= 4) return 100;
            if (consecutive.player === 'X' && consecutive.count >= 4) return -100;
        }

        return null;
    }

    /**
     * Get all possible lines (rows, columns, diagonals) from the board
     * @param {Array} board - Current game board
     * @returns {Array} Array of lines to check
     */
    static getAllLines(board) {
        const lines = [];

        // Rows
        lines.push(...board);

        // Columns
        for (let j = 0; j < 5; j++) {
            const col = board.map(row => row[j]);
            lines.push(col);
        }

        // Diagonals
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                // Main diagonal
                if (i + 3 < 5 && j + 3 < 5) {
                    lines.push([
                        board[i][j],
                        board[i + 1][j + 1],
                        board[i + 2][j + 2],
                        board[i + 3][j + 3]
                    ]);
                }
                // Anti-diagonal
                if (i + 3 < 5 && j - 3 >= 0) {
                    lines.push([
                        board[i][j],
                        board[i + 1][j - 1],
                        board[i + 2][j - 2],
                        board[i + 3][j - 3]
                    ]);
                }
            }
        }

        return lines;
    }

    /**
     * Get the maximum consecutive count and player in a line
     * @param {Array} line - Line to check
     * @returns {Object} Player and count of maximum consecutive symbols
     */
    static getConsecutiveCount(line) {
        let maxCount = 0;
        let maxPlayer = null;
        let currentCount = 0;
        let currentPlayer = null;

        for (const cell of line) {
            if (cell === currentPlayer && cell !== null) {
                currentCount++;
                if (currentCount > maxCount) {
                    maxCount = currentCount;
                    maxPlayer = currentPlayer;
                }
            } else {
                currentPlayer = cell;
                currentCount = 1;
            }
        }

        return { player: maxPlayer, count: maxCount };
    }

    /**
     * Calculate heuristic score for non-terminal board state
     * @param {Array} board - Current game board
     * @returns {number} Heuristic score
     */
    static heuristicScore(board) {
        let score = 0;
        const lines = this.getAllLines(board);

        for (const line of lines) {
            const consecutive = this.getConsecutiveCount(line);
            if (consecutive.player === 'O') {
                if (consecutive.count === 3) score += 5;
                if (consecutive.count === 2) score += 2;
            } else if (consecutive.player === 'X') {
                if (consecutive.count === 3) score -= 5;
                if (consecutive.count === 2) score -= 2;
            }
        }

        return score;
    }

    /**
     * Check if the board is full
     * @param {Array} board - Current game board
     * @returns {boolean} Whether board is full
     */
    static isBoardFull(board) {
        return board.every(row => row.every(cell => cell !== null));
    }
}

export default Minimax;
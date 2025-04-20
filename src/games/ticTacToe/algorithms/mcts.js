/**
 * Monte Carlo Tree Search (MCTS) Implementation for 5×5 Tic Tac Toe
 * Uses UCT (Upper Confidence Bounds for Trees) for node selection
 */

class MCTSNode {
    constructor(board, parent = null, move = null) {
        this.board = board.map(row => [...row]);
        this.parent = parent;
        this.move = move;
        this.children = [];
        this.wins = 0;
        this.visits = 0;
        this.untriedMoves = this.getAvailableMoves();
        this.player = this.getPlayer();
    }

    /**
     * Get available moves on the current board
     * @returns {Array} Array of available moves [row, col]
     */
    getAvailableMoves() {
        const moves = [];
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                if (this.board[i][j] === null) {
                    moves.push([i, j]);
                }
            }
        }
        return moves;
    }

    /**
     * Get the current player (X or O)
     * @returns {string} Current player
     */
    getPlayer() {
        const totalMoves = this.board.flat().filter(cell => cell !== null).length;
        return totalMoves % 2 === 0 ? 'X' : 'O';
    }

    /**
     * Calculate UCT value for node selection
     * @param {number} explorationConstant - Constant for exploration term
     * @returns {number} UCT value
     */
    getUCT(explorationConstant = 1.41) {
        if (this.visits === 0) return Infinity;
        const exploitation = this.wins / this.visits;
        const exploration = explorationConstant * Math.sqrt(Math.log(this.parent.visits) / this.visits);
        return exploitation + exploration;
    }

    /**
     * Check if game is over and get winner
     * @returns {string|null} Winner ('X', 'O', 'draw') or null if game not over
     */
    getGameResult() {
        // Check for win
        const lines = MCTS.getAllLines(this.board);
        for (const line of lines) {
            const consecutive = MCTS.getConsecutiveCount(line);
            if (consecutive.count >= 4) {
                return consecutive.player;
            }
        }

        // Check for draw
        if (this.board.every(row => row.every(cell => cell !== null))) {
            return 'draw';
        }

        return null;
    }
}

class MCTS {
    /**
     * Find the best move using MCTS algorithm
     * @param {Array} board - Current game board
     * @param {number} simulations - Number of simulations to run
     * @returns {Object} Best move {row, col}
     */
    static findBestMove(board, simulations = 1000) {
        const rootNode = new MCTSNode(board);
        const timeLimit = 1000; // 1 second time limit
        const startTime = Date.now();

        while (Date.now() - startTime < timeLimit && simulations > 0) {
            let node = rootNode;
            let boardCopy = board.map(row => [...row]);

            // Selection
            while (node.untriedMoves.length === 0 && node.children.length > 0) {
                node = this.selectNode(node);
                this.applyMove(boardCopy, node.move[0], node.move[1], node.player);
            }

            // Expansion
            if (node.untriedMoves.length > 0 && !node.getGameResult()) {
                const move = node.untriedMoves.pop();
                const player = node.getPlayer();
                this.applyMove(boardCopy, move[0], move[1], player);
                node = new MCTSNode(boardCopy, node, move);
                node.parent.children.push(node);
            }

            // Simulation
            const result = this.simulate(boardCopy);

            // Backpropagation
            while (node !== null) {
                node.visits++;
                if ((result === 'O' && node.player === 'O') || 
                    (result === 'X' && node.player === 'X')) {
                    node.wins++;
                }
                node = node.parent;
            }

            simulations--;
        }

        // Select best move based on visit count
        const bestChild = rootNode.children.reduce((best, child) => 
            child.visits > best.visits ? child : best
        );

        return { row: bestChild.move[0], col: bestChild.move[1] };
    }

    /**
     * Select the most promising node using UCT
     * @param {MCTSNode} node - Current node
     * @returns {MCTSNode} Selected child node
     */
    static selectNode(node) {
        return node.children.reduce((selected, child) => 
            child.getUCT() > selected.getUCT() ? child : selected
        );
    }

    /**
     * Run a random simulation from the current board state
     * @param {Array} board - Current board state
     * @returns {string} Simulation result ('X', 'O', or 'draw')
     */
    static simulate(board) {
        const boardCopy = board.map(row => [...row]);
        let currentPlayer = this.getCurrentPlayer(boardCopy);

        while (true) {
            const moves = this.getAvailableMoves(boardCopy);
            if (moves.length === 0) return 'draw';

            const [row, col] = moves[Math.floor(Math.random() * moves.length)];
            this.applyMove(boardCopy, row, col, currentPlayer);

            const winner = this.checkWin(boardCopy);
            if (winner) return winner;
            if (this.isBoardFull(boardCopy)) return 'draw';

            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        }
    }

    /**
     * Get all possible lines (rows, columns, diagonals) from the board
     * @param {Array} board - Current game board
     * @returns {Array} Array of lines to check
     */
    static getAllLines(board) {
        const lines = [];

        // Rows and columns
        for (let i = 0; i < 5; i++) {
            lines.push(board[i]); // Row
            lines.push(board.map(row => row[i])); // Column
        }

        // Diagonals
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                if (i + 3 < 5 && j + 3 < 5) {
                    lines.push([
                        board[i][j],
                        board[i + 1][j + 1],
                        board[i + 2][j + 2],
                        board[i + 3][j + 3]
                    ]);
                }
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
     * Get consecutive count in a line
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
     * Apply a move to the board
     * @param {Array} board - Current board
     * @param {number} row - Row index
     * @param {number} col - Column index
     * @param {string} player - Current player
     */
    static applyMove(board, row, col, player) {
        board[row][col] = player;
    }

    /**
     * Get available moves on the board
     * @param {Array} board - Current board
     * @returns {Array} Array of available moves [row, col]
     */
    static getAvailableMoves(board) {
        const moves = [];
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                if (board[i][j] === null) {
                    moves.push([i, j]);
                }
            }
        }
        return moves;
    }

    /**
     * Get the current player based on board state
     * @param {Array} board - Current board
     * @returns {string} Current player ('X' or 'O')
     */
    static getCurrentPlayer(board) {
        const moves = board.flat().filter(cell => cell !== null).length;
        return moves % 2 === 0 ? 'X' : 'O';
    }

    /**
     * Check if someone has won
     * @param {Array} board - Current board
     * @returns {string|null} Winner ('X' or 'O') or null
     */
    static checkWin(board) {
        const lines = this.getAllLines(board);
        for (const line of lines) {
            const consecutive = this.getConsecutiveCount(line);
            if (consecutive.count >= 4) {
                return consecutive.player;
            }
        }
        return null;
    }

    /**
     * Check if the board is full
     * @param {Array} board - Current board
     * @returns {boolean} Whether board is full
     */
    static isBoardFull(board) {
        return board.every(row => row.every(cell => cell !== null));
    }
}

module.exports = MCTS;
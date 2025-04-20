/**
 * Tic Tac Toe Bundle
 * Combines all components for browser use
 */

// Minimax Algorithm
class Minimax {
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

    static calculateSearchDepth(board) {
        const emptyCells = board.flat().filter(cell => cell === null).length;
        if (emptyCells > 20) return 3;
        if (emptyCells > 15) return 4;
        if (emptyCells > 10) return 5;
        return 6;
    }

    static minimax(board, depth, isMaximizing, alpha, beta) {
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

    static evaluateBoard(board) {
        const lines = this.getAllLines(board);
        for (const line of lines) {
            const consecutive = this.getConsecutiveCount(line);
            if (consecutive.player === 'O' && consecutive.count >= 4) return 100;
            if (consecutive.player === 'X' && consecutive.count >= 4) return -100;
        }
        return null;
    }

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

    static isBoardFull(board) {
        return board.every(row => row.every(cell => cell !== null));
    }
}

// MCTS Node
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

    getPlayer() {
        const totalMoves = this.board.flat().filter(cell => cell !== null).length;
        return totalMoves % 2 === 0 ? 'X' : 'O';
    }

    getUCT(explorationConstant = 1.41) {
        if (this.visits === 0) return Infinity;
        const exploitation = this.wins / this.visits;
        const exploration = explorationConstant * Math.sqrt(Math.log(this.parent.visits) / this.visits);
        return exploitation + exploration;
    }

    getGameResult() {
        const lines = MCTS.getAllLines(this.board);
        for (const line of lines) {
            const consecutive = MCTS.getConsecutiveCount(line);
            if (consecutive.count >= 4) {
                return consecutive.player;
            }
        }

        if (this.board.every(row => row.every(cell => cell !== null))) {
            return 'draw';
        }

        return null;
    }
}

// MCTS Algorithm
class MCTS {
    static findBestMove(board, simulations = 1000) {
        const rootNode = new MCTSNode(board);
        const timeLimit = 1000;
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

        const bestChild = rootNode.children.reduce((best, child) => 
            child.visits > best.visits ? child : best
        );

        return { row: bestChild.move[0], col: bestChild.move[1] };
    }

    static selectNode(node) {
        return node.children.reduce((selected, child) => 
            child.getUCT() > selected.getUCT() ? child : selected
        );
    }

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

    static getAllLines(board) {
        const lines = [];
        
        // Rows and columns
        for (let i = 0; i < 5; i++) {
            lines.push(board[i]);
            lines.push(board.map(row => row[i]));
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

    static applyMove(board, row, col, player) {
        board[row][col] = player;
    }

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

    static getCurrentPlayer(board) {
        const moves = board.flat().filter(cell => cell !== null).length;
        return moves % 2 === 0 ? 'X' : 'O';
    }

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

    static isBoardFull(board) {
        return board.every(row => row.every(cell => cell !== null));
    }
}

// Game Logic
class TicTacToe {
    constructor() {
        this.board = Array(5).fill().map(() => Array(5).fill(null));
        this.currentPlayer = 'X';
        this.winner = null;
        this.moveCount = 0;
        this.isGameActive = true;
    }

    makeMove(row, col) {
        if (!this.isValidMove(row, col)) {
            return false;
        }

        this.board[row][col] = this.currentPlayer;
        this.moveCount++;

        if (this.checkWin(row, col)) {
            this.winner = this.currentPlayer;
            this.isGameActive = false;
        } else if (this.moveCount === 25) {
            this.winner = 'draw';
            this.isGameActive = false;
        } else {
            this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        }

        return true;
    }

    isValidMove(row, col) {
        return row >= 0 && row < 5 && 
               col >= 0 && col < 5 && 
               this.board[row][col] === null &&
               this.isGameActive;
    }

    checkWin(row, col) {
        const directions = [
            [[0, 1], [0, -1]],
            [[1, 0], [-1, 0]],
            [[1, 1], [-1, -1]],
            [[1, -1], [-1, 1]]
        ];

        const player = this.board[row][col];

        for (const [dir1, dir2] of directions) {
            let count = 1;

            let r = row + dir1[0];
            let c = col + dir1[1];
            while (r >= 0 && r < 5 && c >= 0 && c < 5 && this.board[r][c] === player) {
                count++;
                r += dir1[0];
                c += dir1[1];
            }

            r = row + dir2[0];
            c = col + dir2[1];
            while (r >= 0 && r < 5 && c >= 0 && c < 5 && this.board[r][c] === player) {
                count++;
                r += dir2[0];
                c += dir2[1];
            }

            if (count >= 4) {
                return true;
            }
        }

        return false;
    }

    getGameState() {
        return {
            board: this.board.map(row => [...row]),
            currentPlayer: this.currentPlayer,
            winner: this.winner,
            moveCount: this.moveCount,
            isGameActive: this.isGameActive
        };
    }

    reset() {
        this.board = Array(5).fill().map(() => Array(5).fill(null));
        this.currentPlayer = 'X';
        this.winner = null;
        this.moveCount = 0;
        this.isGameActive = true;
    }
}

// UI Component
class TicTacToeUI {
    constructor() {
        this.game = new TicTacToe();
        
        this.boardElement = null;
        this.statusElement = null;
        this.resetButtonElement = null;
        this.algorithmSelectElement = null;
        
        this.selectedAlgorithm = 'minimax';
        
        this.handleCellClick = this.handleCellClick.bind(this);
        this.handleResetClick = this.handleResetClick.bind(this);
        this.handleAlgorithmChange = this.handleAlgorithmChange.bind(this);
    }

    initialize(boardElementId = 'tic-tac-toe-board', controlsElementId = 'tic-tac-toe-controls') {
        this.boardElement = document.getElementById(boardElementId);
        if (!this.boardElement) {
            throw new Error(`Board element with ID "${boardElementId}" not found`);
        }
        
        const controlsElement = document.getElementById(controlsElementId);
        if (!controlsElement) {
            throw new Error(`Controls element with ID "${controlsElementId}" not found`);
        }
        
        const algorithmContainer = document.createElement('div');
        algorithmContainer.className = 'control-group';
        
        const algorithmLabel = document.createElement('label');
        algorithmLabel.textContent = 'AI Algorithm:';
        algorithmLabel.setAttribute('for', 'algorithm-select');
        
        this.algorithmSelectElement = document.createElement('select');
        this.algorithmSelectElement.id = 'algorithm-select';
        
        const algorithms = [
            { value: 'minimax', text: 'Minimax with Alpha-Beta Pruning' },
            { value: 'mcts', text: 'Monte Carlo Tree Search' }
        ];
        
        algorithms.forEach(algorithm => {
            const option = document.createElement('option');
            option.value = algorithm.value;
            option.textContent = algorithm.text;
            this.algorithmSelectElement.appendChild(option);
        });
        
        this.algorithmSelectElement.addEventListener('change', this.handleAlgorithmChange);
        
        algorithmContainer.appendChild(algorithmLabel);
        algorithmContainer.appendChild(this.algorithmSelectElement);
        controlsElement.appendChild(algorithmContainer);
        
        this.statusElement = document.createElement('div');
        this.statusElement.className = 'game-status';
        controlsElement.appendChild(this.statusElement);
        
        this.resetButtonElement = document.createElement('button');
        this.resetButtonElement.textContent = 'New Game';
        this.resetButtonElement.className = 'btn btn-primary';
        this.resetButtonElement.addEventListener('click', this.handleResetClick);
        controlsElement.appendChild(this.resetButtonElement);
        
        this.render();
    }

    handleCellClick(row, col) {
        if (this.game.currentPlayer === 'O' || !this.game.isGameActive) {
            return;
        }

        if (this.game.makeMove(row, col)) {
            this.render();
            
            if (this.game.isGameActive) {
                setTimeout(() => this.makeComputerMove(), 500);
            }
        }
    }

    makeComputerMove() {
        const board = this.game.getGameState().board;
        let move;

        if (this.selectedAlgorithm === 'minimax') {
            move = Minimax.findBestMove(board);
        } else {
            move = MCTS.findBestMove(board);
        }

        this.game.makeMove(move.row, move.col);
        this.render();
    }

    handleResetClick() {
        this.game.reset();
        this.render();
    }

    handleAlgorithmChange(event) {
        this.selectedAlgorithm = event.target.value;
        if (this.game.isGameActive && this.game.currentPlayer === 'O') {
            this.makeComputerMove();
        }
    }

    render() {
        this.boardElement.innerHTML = '';
        
        const state = this.game.getGameState();
        
        const boardGrid = document.createElement('div');
        boardGrid.className = 'tic-tac-toe-grid';
        
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                if (state.board[i][j]) {
                    cell.classList.add(state.board[i][j]);
                    cell.textContent = state.board[i][j];
                } else {
                    cell.addEventListener('click', () => this.handleCellClick(i, j));
                }
                boardGrid.appendChild(cell);
            }
        }
        
        this.boardElement.appendChild(boardGrid);
        
        let statusMessage;
        if (state.winner) {
            statusMessage = state.winner === 'draw' 
                ? "Game Over - It's a Draw!" 
                : `Game Over - ${state.winner} Wins!`;
            
            if (state.winner === 'O') {
                statusMessage += ` (using ${this.selectedAlgorithm === 'minimax' ? 'Minimax' : 'MCTS'})`;
            }
        } else {
            statusMessage = `Current Player: ${state.currentPlayer}`;
        }
        this.statusElement.textContent = statusMessage;
    }
}

// Export classes for global use
window.Minimax = Minimax;
window.MCTS = MCTS;
window.TicTacToe = TicTacToe;
window.TicTacToeUI = TicTacToeUI;
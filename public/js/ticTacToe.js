/**
 * Tic Tac Toe client-side script
 * This file handles the UI components for the Tic-Tac-Toe game
 * The algorithms are now implemented on the server side for better performance
 */

// Game state and logic
class TicTacToe {
    constructor() {
        // Initialize 5x5 board
        this.board = Array(5).fill().map(() => Array(5).fill(null));
        this.currentPlayer = 'X'; // Player is X, Computer is O
        this.winner = null;
        this.moveCount = 0;
        this.isGameActive = true;
    }

    makeMove(row, col) {
        // Validate move
        if (!this.isValidMove(row, col)) {
            return false;
        }

        // Execute move
        this.board[row][col] = this.currentPlayer;
        this.moveCount++;

        // Check for win or draw
        if (this.checkWin(row, col)) {
            this.winner = this.currentPlayer;
            this.isGameActive = false;
        } else if (this.moveCount === 25) {
            this.winner = 'draw';
            this.isGameActive = false;
        } else {
            // Switch player
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
            [[0, 1], [0, -1]], // Horizontal
            [[1, 0], [-1, 0]], // Vertical
            [[1, 1], [-1, -1]], // Diagonal
            [[1, -1], [-1, 1]] // Anti-diagonal
        ];

        const player = this.board[row][col];

        for (const [dir1, dir2] of directions) {
            let count = 1;

            // Check in first direction
            let r = row + dir1[0];
            let c = col + dir1[1];
            while (r >= 0 && r < 5 && c >= 0 && c < 5 && this.board[r][c] === player) {
                count++;
                r += dir1[0];
                c += dir1[1];
            }

            // Check in opposite direction
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
        
        // DOM elements
        this.boardElement = null;
        this.statusElement = null;
        this.resetButtonElement = null;
        this.algorithmSelectElement = null;
        
        // AI settings
        this.selectedAlgorithm = 'minimax';
        this.isComputerThinking = false;
        
        // Bind event handlers
        this.handleCellClick = this.handleCellClick.bind(this);
        this.handleResetClick = this.handleResetClick.bind(this);
        this.handleAlgorithmChange = this.handleAlgorithmChange.bind(this);
    }

    initialize(boardElementId = 'tic-tac-toe-board', controlsElementId = 'tic-tac-toe-controls') {
        // Initialize board container
        this.boardElement = document.getElementById(boardElementId);
        if (!this.boardElement) {
            throw new Error(`Board element with ID "${boardElementId}" not found`);
        }
        
        // Initialize controls container
        const controlsElement = document.getElementById(controlsElementId);
        if (!controlsElement) {
            throw new Error(`Controls element with ID "${controlsElementId}" not found`);
        }
        
        // Create algorithm selector
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
        
        // Create status element
        this.statusElement = document.createElement('div');
        this.statusElement.className = 'game-status';
        controlsElement.appendChild(this.statusElement);
        
        // Create reset button
        this.resetButtonElement = document.createElement('button');
        this.resetButtonElement.textContent = 'New Game';
        this.resetButtonElement.className = 'btn btn-primary';
        this.resetButtonElement.addEventListener('click', this.handleResetClick);
        controlsElement.appendChild(this.resetButtonElement);
        
        // Initial render
        this.render();
    }

    handleCellClick(row, col) {
        if (this.game.currentPlayer === 'O' || !this.game.isGameActive || this.isComputerThinking) {
            return;
        }

        if (this.game.makeMove(row, col)) {
            this.render();
            
            // If game is still active, make computer move
            if (this.game.isGameActive) {
                this.isComputerThinking = true;
                this.statusElement.textContent = "Computer is thinking...";
                this.boardElement.classList.add('ai-thinking');
                
                setTimeout(() => this.makeComputerMove(), 500);
            }
        }
    }

    async makeComputerMove() {
        try {
            const board = this.game.getGameState().board;
            
            // Call server API to get AI move
            const response = await fetch('/api/games/tic-tac-toe/move', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    board,
                    algorithm: this.selectedAlgorithm
                })
            });
            
            if (!response.ok) {
                throw new Error('Server error');
            }
            
            const data = await response.json();
            
            // Apply the move from the server
            if (data.success && data.move) {
                this.game.makeMove(data.move.row, data.move.col);
                
                // Store algorithm performance data
                this.lastMoveTime = data.executionTime;
                this.lastAlgorithm = data.algorithm;
            } else {
                console.error('Invalid move received from server', data);
            }
        } catch (error) {
            console.error('Error getting AI move:', error);
            this.statusElement.textContent = "Error: Couldn't get computer move. Please try again.";
        } finally {
            this.isComputerThinking = false;
            this.boardElement.classList.remove('ai-thinking');
            this.render();
        }
    }

    handleResetClick() {
        if (this.isComputerThinking) return;
        this.game.reset();
        this.lastMoveTime = null;
        this.lastAlgorithm = null;
        this.render();
    }

    handleAlgorithmChange(event) {
        this.selectedAlgorithm = event.target.value;
        if (this.game.isGameActive && this.game.currentPlayer === 'O' && !this.isComputerThinking) {
            // If it's computer's turn, make a move with the new algorithm
            this.isComputerThinking = true;
            this.statusElement.textContent = "Computer is thinking...";
            this.boardElement.classList.add('ai-thinking');
            setTimeout(() => this.makeComputerMove(), 500);
        }
    }

    render() {
        // Clear board
        this.boardElement.innerHTML = '';
        
        // Get game state
        const state = this.game.getGameState();
        
        // Create board grid
        const boardGrid = document.createElement('div');
        boardGrid.className = 'tic-tac-toe-grid';
        if (state.currentPlayer === 'X') {
            boardGrid.classList.add('player-turn');
        }
        
        // Create cells
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
        
        // Update status message
        let statusMessage;
        if (state.winner) {
            statusMessage = state.winner === 'draw' 
                ? "Game Over - It's a Draw!" 
                : `Game Over - ${state.winner} Wins!`;
            
            // Add algorithm info if computer won
            if (state.winner === 'O' && this.lastAlgorithm && this.lastMoveTime !== null) {
                const algorithmName = this.lastAlgorithm === 'minimax' ? 'Minimax' : 'MCTS';
                statusMessage += ` (using ${algorithmName}, ${(this.lastMoveTime * 1000).toFixed(2)}ms)`;
            }
        } else if (this.isComputerThinking) {
            statusMessage = "Computer is thinking...";
        } else {
            statusMessage = `Current Player: ${state.currentPlayer}`;
        }
        this.statusElement.textContent = statusMessage;
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const ui = new TicTacToeUI();
    ui.initialize();
    
    // Export for debugging
    window.TicTacToe = TicTacToe;
    window.TicTacToeUI = ui;
});
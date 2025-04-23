/**
 * Eight Queens Bundle
 * Combines all components for browser use
 */

// Game Logic
class EightQueens {
    constructor() {
        this.board = Array(8).fill().map(() => Array(8).fill(false));
        this.queens = [];
        this.gameId = null;
        this.timer = {
            start: function() {},
            stop: function() { return Date.now(); }
        };
        this.isComplete = false;
    }

    async initialize() {
        this.board = Array(8).fill().map(() => Array(8).fill(false));
        this.queens = [];
        this.isComplete = false;
        this.timer.start();
    }

    static positionToCoordinates(position) {
        const col = position.charCodeAt(0) - 'a'.charCodeAt(0);
        const row = 8 - parseInt(position[1]);
        return { row, col };
    }

    static coordinatesToPosition(row, col) {
        const colLetter = String.fromCharCode('a'.charCodeAt(0) + col);
        const rowNumber = 8 - row;
        return `${colLetter}${rowNumber}`;
    }

    placeQueen(position) {
        try {
            // Validate the new placement
            const { row, col } = EightQueens.positionToCoordinates(position);
            
            // Check if any existing queen can attack this position
            if (this.isUnderAttack(position)) {
                return false;
            }
            
            // Place the queen
            this.board[row][col] = true;
            this.queens.push(position);

            // Check if puzzle is complete
            if (this.queens.length === 8) {
                this.isComplete = true;
                this.endGame();
            }

            return true;
        } catch (error) {
            console.error(`Invalid queen placement: ${error.message}`);
            return false;
        }
    }

    removeQueen(position) {
        const index = this.queens.indexOf(position);
        if (index === -1) return false;

        const { row, col } = EightQueens.positionToCoordinates(position);
        this.board[row][col] = false;
        this.queens.splice(index, 1);
        this.isComplete = false;
        return true;
    }

    isUnderAttack(position) {
        const { row, col } = EightQueens.positionToCoordinates(position);
        
        // Check if any existing queen can attack this position
        for (const queenPos of this.queens) {
            const queen = EightQueens.positionToCoordinates(queenPos);
            
            // Same row or column
            if (queen.row === row || queen.col === col) return true;
            
            // Diagonal
            if (Math.abs(queen.row - row) === Math.abs(queen.col - col)) return true;
        }
        
        return false;
    }

    async endGame() {
        const endTime = this.timer.stop();
        console.log(`Eight Queens puzzle completed in ${endTime}ms`);
    }

    getGameState() {
        return {
            board: this.board.map(row => [...row]),
            queens: [...this.queens],
            isComplete: this.isComplete,
            gameId: this.gameId
        };
    }

    reset() {
        this.board = Array(8).fill().map(() => Array(8).fill(false));
        this.queens = [];
        this.isComplete = false;
        this.timer.start();
    }
}

// UI Component
class EightQueensUI {
    constructor() {
        this.game = new EightQueens();
        
        // DOM elements
        this.boardElement = null;
        this.statusElement = null;
        this.controlsElement = null;
        this.resetButtonElement = null;
        
        // Bind methods
        this.handleCellClick = this.handleCellClick.bind(this);
        this.handleResetClick = this.handleResetClick.bind(this);
    }

    async initialize(boardElementId = 'queens-board', controlsElementId = 'queens-controls') {
        // Initialize board container
        this.boardElement = document.getElementById(boardElementId);
        if (!this.boardElement) {
            throw new Error(`Board element with ID "${boardElementId}" not found`);
        }

        // Initialize controls container
        this.controlsElement = document.getElementById(controlsElementId);
        if (!this.controlsElement) {
            throw new Error(`Controls element with ID "${controlsElementId}" not found`);
        }

        // Create status element
        this.statusElement = document.createElement('div');
        this.statusElement.className = 'game-status';
        this.controlsElement.appendChild(this.statusElement);

        // Create reset button
        this.resetButtonElement = document.createElement('button');
        this.resetButtonElement.textContent = 'New Puzzle';
        this.resetButtonElement.className = 'btn btn-primary';
        this.resetButtonElement.addEventListener('click', this.handleResetClick);
        this.controlsElement.appendChild(this.resetButtonElement);

        // Initialize game
        await this.game.initialize();
        this.render();
    }

    handleCellClick(row, col) {
        const position = EightQueens.coordinatesToPosition(row, col);
        const state = this.game.getGameState();
        
        if (state.board[row][col]) {
            // Remove queen if already placed
            if (this.game.removeQueen(position)) {
                this.render();
            }
        } else {
            // Try to place a queen
            if (this.game.placeQueen(position)) {
                this.render();
            }
        }
    }

    async handleResetClick() {
        await this.game.initialize();
        this.render();
    }

    render() {
        // Clear board
        this.boardElement.innerHTML = '';
        
        const state = this.game.getGameState();
        
        // Create chessboard
        const board = document.createElement('div');
        board.className = 'chessboard';
        
        // Create cells
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell' + ((row + col) % 2 ? ' dark' : ' light');
                
                // Add position attribute
                const position = EightQueens.coordinatesToPosition(row, col);
                cell.dataset.position = position;
                
                // Add queen if present
                if (state.board[row][col]) {
                    cell.classList.add('queen');
                } else if (this.game.isUnderAttack(position)) {
                    cell.classList.add('attacked');
                }
                
                cell.addEventListener('click', () => this.handleCellClick(row, col));
                board.appendChild(cell);
            }
        }
        
        this.boardElement.appendChild(board);
        
        // Update status
        let statusText = '';
        if (state.isComplete) {
            statusText = 'Puzzle Complete! All queens placed successfully.';
        } else {
            const remainingQueens = 8 - state.queens.length;
            statusText = `Place ${remainingQueens} more queen${remainingQueens !== 1 ? 's' : ''} on the board.`;
        }
        this.statusElement.textContent = statusText;
    }

    cleanup() {
        if (this.resetButtonElement) {
            this.resetButtonElement.removeEventListener('click', this.handleResetClick);
        }
    }
}

// Export classes for global use
window.EightQueens = EightQueens;
window.EightQueensUI = EightQueensUI;

// Initialize game when document is loaded
document.addEventListener('DOMContentLoaded', function() {
    const gameUI = new EightQueensUI();
    gameUI.initialize('queens-board', 'queens-controls').catch(console.error);
});
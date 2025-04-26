/**
 * Eight Queens client-side script
 * The UI components for the Eight Queens puzzle
 * The algorithms are now implemented on the server side for better performance
 */

// Game Logic
class EightQueens {
    constructor() {
        this.board = Array(8).fill().map(() => Array(8).fill(false));
        this.queens = [];
        this.gameId = null;
        this.timer = {
            start: function() { this.startTime = Date.now(); },
            stop: function() { return Date.now() - this.startTime; },
            startTime: Date.now()
        };
        this.isComplete = false;
        this.solutionIndex = -1; // Index of the current solution
        this.isSolving = false;
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

    /**
     * Get solutions from server-side algorithm
     * @param {string} algorithm - Algorithm to use ('sequential' or 'threaded')
     * @returns {Promise<Object>} - Promise resolving to solution object
     */
    async getSolutions(algorithm = 'sequential') {
        try {
            this.isSolving = true;

            const response = await fetch('/api/games/eight-queens/solve', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    algorithm,
                    initialQueens: this.queens.length > 0 ? this.queens : null
                })
            });

            if (!response.ok) {
                throw new Error('Server error');
            }

            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Failed to get solutions');
            }

            this.isSolving = false;
            
            return {
                solutions: data.solutions,
                executionTime: data.executionTime,
                algorithm: data.algorithm,
                solutionCount: data.solutions.length
            };
        } catch (error) {
            this.isSolving = false;
            console.error('Error getting solutions:', error);
            throw error;
        }
    }

    getGameState() {
        return {
            board: this.board.map(row => [...row]),
            queens: [...this.queens],
            isComplete: this.isComplete,
            gameId: this.gameId,
            isSolving: this.isSolving
        };
    }

    reset() {
        this.board = Array(8).fill().map(() => Array(8).fill(false));
        this.queens = [];
        this.isComplete = false;
        this.timer.start();
    }

    // Apply a saved solution to the board
    applySolution(solution) {
        this.reset();
        solution.forEach(position => this.placeQueen(position));
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
        this.sequentialButtonElement = null;
        this.threadedButtonElement = null;
        this.solutionContainerElement = null;
        this.solutionNavigationElement = null;
        
        // Solution state
        this.currentSolutions = [];
        this.currentSolutionIndex = 0;
        this.selectedAlgorithm = 'sequential';
        
        // Bind methods
        this.handleCellClick = this.handleCellClick.bind(this);
        this.handleResetClick = this.handleResetClick.bind(this);
        this.handleSequentialSolveClick = this.handleSequentialSolveClick.bind(this);
        this.handleThreadedSolveClick = this.handleThreadedSolveClick.bind(this);
        this.handleNextSolutionClick = this.handleNextSolutionClick.bind(this);
        this.handlePrevSolutionClick = this.handlePrevSolutionClick.bind(this);
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

        // Create algorithm buttons
        const algorithmContainer = document.createElement('div');
        algorithmContainer.className = 'buttons-container mb-3';

        this.sequentialButtonElement = document.createElement('button');
        this.sequentialButtonElement.textContent = 'Solve (Sequential)';
        this.sequentialButtonElement.className = 'btn btn-primary';
        this.sequentialButtonElement.addEventListener('click', this.handleSequentialSolveClick);
        algorithmContainer.appendChild(this.sequentialButtonElement);

        this.threadedButtonElement = document.createElement('button');
        this.threadedButtonElement.textContent = 'Solve (Threaded)';
        this.threadedButtonElement.className = 'btn btn-info';
        this.threadedButtonElement.addEventListener('click', this.handleThreadedSolveClick);
        algorithmContainer.appendChild(this.threadedButtonElement);

        this.controlsElement.appendChild(algorithmContainer);

        // Create solution navigation
        this.solutionContainerElement = document.createElement('div');
        this.solutionContainerElement.className = 'solution-container mb-3';
        this.solutionContainerElement.style.display = 'none';

        this.solutionNavigationElement = document.createElement('div');
        this.solutionNavigationElement.className = 'd-flex align-items-center justify-content-between';

        const prevButton = document.createElement('button');
        prevButton.textContent = '← Previous';
        prevButton.className = 'btn btn-sm btn-secondary';
        prevButton.addEventListener('click', this.handlePrevSolutionClick);

        this.solutionStatusElement = document.createElement('span');
        this.solutionStatusElement.className = 'mx-2';
        this.solutionStatusElement.textContent = 'Solution 0 of 0';

        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next →';
        nextButton.className = 'btn btn-sm btn-secondary';
        nextButton.addEventListener('click', this.handleNextSolutionClick);

        this.solutionNavigationElement.appendChild(prevButton);
        this.solutionNavigationElement.appendChild(this.solutionStatusElement);
        this.solutionNavigationElement.appendChild(nextButton);

        this.solutionContainerElement.appendChild(this.solutionNavigationElement);
        this.controlsElement.appendChild(this.solutionContainerElement);

        // Create status element
        this.statusElement = document.createElement('div');
        this.statusElement.className = 'game-status';
        this.controlsElement.appendChild(this.statusElement);

        // Create reset button
        this.resetButtonElement = document.createElement('button');
        this.resetButtonElement.textContent = 'New Puzzle';
        this.resetButtonElement.className = 'btn btn-secondary';
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
        this.currentSolutions = [];
        this.currentSolutionIndex = 0;
        this.solutionContainerElement.style.display = 'none';
        await this.game.initialize();
        this.render();
    }

    async handleSequentialSolveClick() {
        await this.handleSolveClick('sequential');
    }

    async handleThreadedSolveClick() {
        await this.handleSolveClick('threaded');
    }

    async handleSolveClick(algorithm) {
        try {
            // Disable UI during solving
            this.setButtonsEnabled(false);
            this.statusElement.textContent = 'Finding solutions...';
            
            // Get solutions from server
            const result = await this.game.getSolutions(algorithm);
            
            // Update UI with solutions
            this.currentSolutions = result.solutions;
            this.currentSolutionIndex = 0;
            this.selectedAlgorithm = algorithm;
            
            if (this.currentSolutions.length > 0) {
                this.solutionContainerElement.style.display = 'block';
                this.statusElement.textContent = `Found ${result.solutionCount} solutions in ${result.executionTime.toFixed(3)} seconds using ${algorithm} algorithm.`;
                
                // Show first solution
                this.game.reset();
                this.game.applySolution(this.currentSolutions[0]);
            } else {
                this.solutionContainerElement.style.display = 'none';
                this.statusElement.textContent = 'No solutions found!';
            }
            
            this.updateSolutionNavigation();
            this.render();
            
        } catch (error) {
            this.statusElement.textContent = `Error: ${error.message}`;
            console.error('Error solving puzzle:', error);
        } finally {
            // Re-enable UI
            this.setButtonsEnabled(true);
        }
    }

    handleNextSolutionClick() {
        if (this.currentSolutions.length === 0) return;
        
        this.currentSolutionIndex = (this.currentSolutionIndex + 1) % this.currentSolutions.length;
        this.game.reset();
        this.game.applySolution(this.currentSolutions[this.currentSolutionIndex]);
        this.updateSolutionNavigation();
        this.render();
    }

    handlePrevSolutionClick() {
        if (this.currentSolutions.length === 0) return;
        
        this.currentSolutionIndex = (this.currentSolutionIndex - 1 + this.currentSolutions.length) % this.currentSolutions.length;
        this.game.reset();
        this.game.applySolution(this.currentSolutions[this.currentSolutionIndex]);
        this.updateSolutionNavigation();
        this.render();
    }

    updateSolutionNavigation() {
        if (this.currentSolutions.length > 0) {
            this.solutionStatusElement.textContent = `Solution ${this.currentSolutionIndex + 1} of ${this.currentSolutions.length}`;
        } else {
            this.solutionStatusElement.textContent = 'No solutions';
        }
    }

    setButtonsEnabled(enabled) {
        this.resetButtonElement.disabled = !enabled;
        this.sequentialButtonElement.disabled = !enabled;
        this.threadedButtonElement.disabled = !enabled;
    }

    render() {
        // Clear board
        this.boardElement.innerHTML = '';
        
        const state = this.game.getGameState();
        
        // Create chessboard
        const board = document.createElement('div');
        board.className = 'chessboard';
        
        // Add loading class if solving
        if (state.isSolving) {
            board.classList.add('solving');
        }
        
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
        
        // Update status if not already set during solving
        if (!state.isSolving && this.statusElement.textContent !== 'Finding solutions...') {
            let statusText = '';
            if (state.isComplete) {
                statusText = 'Puzzle Complete! All queens placed successfully.';
            } else {
                const remainingQueens = 8 - state.queens.length;
                statusText = `Place ${remainingQueens} more queen${remainingQueens !== 1 ? 's' : ''} on the board.`;
            }
            this.statusElement.textContent = statusText;
        }
    }

    cleanup() {
        if (this.resetButtonElement) {
            this.resetButtonElement.removeEventListener('click', this.handleResetClick);
        }
        if (this.sequentialButtonElement) {
            this.sequentialButtonElement.removeEventListener('click', this.handleSequentialSolveClick);
        }
        if (this.threadedButtonElement) {
            this.threadedButtonElement.removeEventListener('click', this.handleThreadedSolveClick);
        }
    }
}

// Initialize game when document is loaded
document.addEventListener('DOMContentLoaded', function() {
    const gameUI = new EightQueensUI();
    gameUI.initialize('queens-board', 'queens-controls').catch(console.error);
    
    // Export for debugging
    window.EightQueens = EightQueens;
    window.EightQueensUI = gameUI;
});
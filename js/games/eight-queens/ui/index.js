/**
 * Eight Queens UI Module
 * Handles the user interface and interactions for the Eight Queens puzzle
 */

import Timer from '../../../utils/timer.js';
import logger from '../../../utils/logger.js';
import EightQueens from '../game.js';
import * as apiService from '../services/api.js'; // Import the service

export class EightQueensUI {
    constructor() {
        this.game = null;
        
        // DOM elements
        this.boardElement = null;
        this.statusElement = null;
        this.messageElement = null;
        this.queenCountElement = null;
        this.algorithmSelectElement = null;
        this.solveButtonElement = null;
        this.resetButtonElement = null;
        this.metricsElement = null;
        
        // Board state
        this.selectedAlgorithm = 'sequential';
        this.isSolving = false;
        this.draggedQueen = null;
        
        // Bind event handlers
        this.handleCellClick = this.handleCellClick.bind(this);
        this.handleSolveClick = this.handleSolveClick.bind(this);
        this.handleResetClick = this.handleResetClick.bind(this);
        this.handleAlgorithmChange = this.handleAlgorithmChange.bind(this);
        this.handleDragStart = this.handleDragStart.bind(this);
        this.handleDrop = this.handleDrop.bind(this);
        this.handleDragOver = this.handleDragOver.bind(this);
    }

    initialize(game, boardElementId = 'eight-queens-board', controlsElementId = 'eight-queens-controls') {
        console.log('EightQueensUI initialize called');
        
        this.game = game;
        
        this.boardElement = document.getElementById(boardElementId);
        if (!this.boardElement) {
            console.error(`Board element with ID "${boardElementId}" not found in the DOM`);
            throw new Error(`Board element with ID "${boardElementId}" not found`);
        }
        
        const controlsElement = document.getElementById(controlsElementId);
        if (!controlsElement) {
            console.error(`Controls element with ID "${controlsElementId}" not found in the DOM`);
            throw new Error(`Controls element with ID "${controlsElementId}" not found`);
        }
        
        // Clear controls container before adding new ones
        controlsElement.innerHTML = '';

        this.createAlgorithmSelector(controlsElement);
        this.createStatusElements(controlsElement);
        this.createActionButtons(controlsElement);
        
        // Render the initial board
        this.render();
    }

    async handleCellClick(row, col) {
        if (this.isSolving) return;
        
        const position = { row, col };
        const hasQueen = this.game.board[row][col];
        
        if (hasQueen) {
            // Remove queen
            const success = this.game.removeQueen(position);
            if (success) {
                this.render();
                this.updateStatus();
                this.clearMessage(); // Clear message on successful removal
            }
        } else {
            // Place queen
            const result = await this.game.placeQueen(position);
            if (result.success) {
                this.render();
                this.updateStatus();
                
                // Check if puzzle is complete
                if (this.game.isComplete) {
                    if (result.alreadyFound) {
                         this.setMessage('Congratulations! You found a solution, but it has already been submitted by another player.', 'message-warning');
                    } else {
                        this.setMessage('Congratulations! You solved the Eight Queens puzzle with a new solution!', 'message-success');
                    }
                    this.disableBoard();
                }
            } else {
                this.setMessage(result.message || 'Cannot place a queen here!', 'message-warning');
            }
        }
    }

    async handleSolveClick() {
        if (this.isSolving) return;
        
        this.isSolving = true;
        this.boardElement.classList.add('solving');
        this.solveButtonElement.disabled = true;
        this.statusElement.textContent = 'Solving...';
        this.clearMessage();
        
        try {
            const options = {
                maxSolutions: 0, // Find all solutions
                threads: this.selectedAlgorithm === 'threaded' ? navigator.hardwareConcurrency || 4 : undefined
            };
            
            const result = await this.game.getSolutions(this.selectedAlgorithm, options);
            
            if (result.success && result.solutions && result.solutions.length > 0) {
                // Apply the first solution found by the algorithm to the board for display
                this.game.applySolution(result.solutions[0]); 
                
                this.render();
                this.showPerformanceMetrics(this.selectedAlgorithm, result.count, result.executionTime);
                this.setMessage(`Solver found ${result.count} solutions using the ${this.selectedAlgorithm} algorithm. Displaying the first one.`, 'message-info');
                
                // Mark puzzle as complete (since a solution is displayed)
                this.game.isComplete = true; 
                this.disableBoard();
            } else if (result.success) {
                 this.setMessage('No solutions found by the solver.', 'message-info');
            } else {
                this.setMessage(`Error finding solutions: ${result.error}`, 'message-error');
            }
        } catch (error) {
            console.error('Error solving Eight Queens puzzle:', error);
            this.setMessage('Error solving puzzle: ' + error.message, 'message-error');
        } finally {
            this.isSolving = false;
            this.boardElement.classList.remove('solving');
            this.solveButtonElement.disabled = false;
            this.statusElement.textContent = 'Solver finished';
        }
    }

    showPerformanceMetrics(algorithm, solutionCount, time) {
        this.metricsElement.style.display = 'block';
        
        // Ensure time is properly formatted - display as ms if less than 0.001 seconds
        const formattedTime = time < 0.001 ? 
            `${(time * 1000).toFixed(3)} ms` : 
            `${time.toFixed(3)} seconds`;
            
        this.metricsElement.innerHTML = `
            <div class="metrics-title">Performance Metrics</div>
            <div class="algorithm-metrics">
                <span class="metrics-label">Algorithm:</span>
                <span>${algorithm === 'sequential' ? 'Sequential' : 'Threaded'}</span>
            </div>
            <div class="algorithm-metrics">
                <span class="metrics-label">Solutions Found:</span>
                <span>${solutionCount}</span>
            </div>
            <div class="algorithm-metrics">
                <span class="metrics-label">Execution Time:</span>
                <span>${formattedTime}</span>
            </div>
        `;
    }

    handleResetClick() {
        if (this.isSolving) return;
        
        this.game.reset();
        this.enableBoard();
        this.clearMessage();
        this.metricsElement.style.display = 'none';
        this.render();
        this.updateStatus();
        
        this.setMessage('Board reset.', 'message-info');
    }
    
    handleAlgorithmChange(event) {
        this.selectedAlgorithm = event.target.value;
    }
    
    handleDragStart(event, row, col) {
        if (this.game.board[row][col]) {
            this.draggedQueen = { row, col };
            event.dataTransfer.setData('text/plain', `${row},${col}`);
            event.dataTransfer.effectAllowed = 'move';
        }
    }
    
    handleDragOver(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }
    
    async handleDrop(event, row, col) {
        event.preventDefault();
        
        if (!this.draggedQueen || this.isSolving || this.game.isComplete) return;
        
        // Remove queen from the original position
        this.game.removeQueen(this.draggedQueen);
        
        // Try to place queen at the new position
        const success = await this.game.placeQueen({ row, col });
        
        if (!success) {
            // If placement fails, put queen back to the original position
            await this.game.placeQueen(this.draggedQueen, true);
            this.setMessage('Cannot place a queen here - it would be under attack!', 'message-warning');
        }
        
        this.draggedQueen = null;
        this.render();
        this.updateStatus();
        
        // Check if puzzle is complete
        if (this.game.isComplete) {
            this.setMessage('Congratulations! You solved the Eight Queens puzzle!', 'message-success');
            this.disableBoard();
        }
    }
    
    updateStatus() {
        const queenCount = this.game.queens.length;
        this.queenCountElement.textContent = queenCount;
        
        if (this.game.isComplete) {
            this.statusElement.textContent = "Puzzle Solved! 🏆";
        } else {
            this.statusElement.textContent = `Place ${8 - queenCount} more queens`;
        }
    }
    
    setMessage(message, className = 'message-info') {
        this.messageElement.textContent = message;
        this.messageElement.className = `message-area ${className}`;
    }
    
    clearMessage() {
        this.messageElement.textContent = '';
        this.messageElement.className = 'message-area';
    }
    
    disableBoard() {
        this.boardElement.classList.add('disabled');
    }
    
    enableBoard() {
        this.boardElement.classList.remove('disabled');
    }

    render() {
        // Clear board
        this.boardElement.innerHTML = '';
        
        // Create board container - CHANGED to match Knight's Tour exactly 
        // Using 'chess-board' class instead of 'chessboard'
        const boardContainer = document.createElement('div');
        boardContainer.className = 'chess-board';
        boardContainer.style.gridTemplateColumns = `repeat(8, 1fr)`;
        
        // Create cells
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                // Create cell with same classes as Knight's Tour
                const cell = document.createElement('div');
                cell.className = `cell ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                // Add coordinate label exactly like Knight's Tour
                const coordinate = document.createElement('div');
                coordinate.className = 'coordinate';
                coordinate.textContent = String.fromCharCode(97 + col) + (8 - row); // Chess notation
                cell.appendChild(coordinate);
                
                // Add queen if there is one - MATCH KNIGHT'S STRUCTURE EXACTLY
                if (this.game.board[row][col]) {
                    // Create container first (like knight container in Knight's Tour)
                    const queenContainer = document.createElement('div');
                    queenContainer.className = 'knight'; // Use the same class as Knight's Tour
                    
                    // Add icon inside container
                    const queenIcon = document.createElement('i');
                    queenIcon.className = 'fas fa-chess-queen'; // Use queen icon
                    queenContainer.appendChild(queenIcon);
                    
                    // Make draggable if not complete
                    queenContainer.draggable = !this.game.isComplete;
                    if (!this.game.isComplete) {
                        queenContainer.addEventListener('dragstart', (e) => this.handleDragStart(e, row, col));
                    }
                    
                    // Add to cell
                    cell.appendChild(queenContainer);
                    cell.classList.add('visited'); // Match Knight's Tour 'visited' class
                }
                
                // Add click event
                cell.addEventListener('click', () => this.handleCellClick(row, col));
                
                // Add drop events
                cell.addEventListener('dragover', this.handleDragOver);
                cell.addEventListener('drop', (e) => this.handleDrop(e, row, col));
                
                boardContainer.appendChild(cell);
            }
        }
        
        this.boardElement.appendChild(boardContainer);
        
        this.updateStatus();
    }

    createAlgorithmSelector(containerElement) {
        const algorithmLabel = document.createElement('label');
        algorithmLabel.textContent = 'Algorithm: ';
        
        this.algorithmSelectElement = document.createElement('select');
        
        const algorithms = [
            { value: 'sequential', text: "Sequential Algorithm" },
            { value: 'threaded', text: 'Threaded Algorithm' }
        ];
        
        algorithms.forEach(algo => {
            const option = document.createElement('option');
            option.value = algo.value;
            option.textContent = algo.text;
            if (algo.value === this.selectedAlgorithm) option.selected = true;
            this.algorithmSelectElement.appendChild(option);
        });
        
        this.algorithmSelectElement.addEventListener('change', this.handleAlgorithmChange);
        
        const controlGroup = document.createElement('div');
        controlGroup.className = 'control-group';
        controlGroup.appendChild(algorithmLabel);
        controlGroup.appendChild(this.algorithmSelectElement);
        containerElement.appendChild(controlGroup);
    }
    
    createStatusElements(containerElement) {
        // Queen counter
        const queenCountContainer = document.createElement('div');
        queenCountContainer.className = 'queen-count';
        
        const queenCountLabel = document.createElement('span');
        queenCountLabel.textContent = 'Queens Placed: ';
        queenCountContainer.appendChild(queenCountLabel);
        
        this.queenCountElement = document.createElement('span');
        this.queenCountElement.className = 'count';
        this.queenCountElement.textContent = '0';
        queenCountContainer.appendChild(this.queenCountElement);
        
        containerElement.appendChild(queenCountContainer);
        
        // Status message
        this.statusElement = document.createElement('div');
        this.statusElement.className = 'status';
        containerElement.appendChild(this.statusElement);
        
        // Message area
        this.messageElement = document.createElement('div');
        this.messageElement.className = 'message-area';
        containerElement.appendChild(this.messageElement);
        
        // Performance metrics
        this.metricsElement = document.createElement('div');
        this.metricsElement.className = 'performance-metrics';
        this.metricsElement.style.display = 'none';
        containerElement.appendChild(this.metricsElement);
    }
    
    createActionButtons(containerElement) {
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-container';
        
        // Solve button
        this.solveButtonElement = document.createElement('button');
        this.solveButtonElement.className = 'btn btn-primary';
        this.solveButtonElement.textContent = 'Solve';
        this.solveButtonElement.addEventListener('click', this.handleSolveClick);
        buttonContainer.appendChild(this.solveButtonElement);
        
        // Reset button
        this.resetButtonElement = document.createElement('button');
        this.resetButtonElement.className = 'btn btn-secondary';
        this.resetButtonElement.textContent = 'Reset';
        this.resetButtonElement.addEventListener('click', this.handleResetClick);
        buttonContainer.appendChild(this.resetButtonElement);
        
        containerElement.appendChild(buttonContainer);
    }
}

// Add static init method for easier initialization from the app loader
EightQueensUI.init = async function() {
    try {
        // Ensure correct import path and default export usage
        const EightQueensGame = (await import('../game.js')).default;
        const gameInstance = new EightQueensGame(); // Use player ID if available/needed
        const uiInstance = new EightQueensUI();
        
        // Ensure the DOM is ready before initializing UI components
        if (document.readyState === 'loading') {
            await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
        }
        
        // Make sure the target elements exist before calling initialize
        const boardElementId = 'eight-queens-board';
        const controlsElementId = 'eight-queens-controls';
        if (!document.getElementById(boardElementId) || !document.getElementById(controlsElementId)) {
             console.warn(`Required elements (${boardElementId}, ${controlsElementId}) not found. Skipping Eight Queens UI initialization.`);
             return null; // Or handle appropriately
        }

        await uiInstance.initialize(gameInstance, boardElementId, controlsElementId);
        return uiInstance;
    } catch (error) {
        console.error('Failed to initialize Eight Queens UI:', error);
        // Optionally display an error message to the user in the UI
        const errorElement = document.getElementById('eight-queens-board'); // Or a dedicated error area
        if (errorElement) {
            errorElement.innerHTML = '<div class="alert alert-danger">Failed to load Eight Queens game. Please check console for details.</div>';
        }
        throw error;
    }
};

// Export the class as default to match app.js import expectations
export default EightQueensUI;
/**
 * Knight's Tour UI Module
 * Handles the user interface and interactions for the Knight's Tour puzzle
 */

import { Timer } from '../../../utils/timer.js';
import logger from '../../../utils/logger.js';
import KnightsTour from '../game.js';

export class KnightsTourUI {
    constructor() {
        this.game = null;
        
        // DOM elements
        this.boardElement = null;
        this.statusElement = null;
        this.messageElement = null;
        this.moveCountElement = null;
        this.algorithmSelectElement = null;
        this.solveButtonElement = null;
        this.resetButtonElement = null;
        this.randomButtonElement = null;
        this.speedControlElement = null;
        this.metricsElement = null;
        
        // Board state
        this.selectedAlgorithm = 'warnsdorff';
        this.isSolving = false;
        this.animationSpeed = 300; // Default animation speed in ms
        this.boardSize = 8; // Default board size
        
        // Bind event handlers
        this.handleCellClick = this.handleCellClick.bind(this);
        this.handleSolveClick = this.handleSolveClick.bind(this);
        this.handleResetClick = this.handleResetClick.bind(this);
        this.handleRandomClick = this.handleRandomClick.bind(this);
        this.handleAlgorithmChange = this.handleAlgorithmChange.bind(this);
        this.handleSpeedChange = this.handleSpeedChange.bind(this);
        this.handleBoardSizeChange = this.handleBoardSizeChange.bind(this);
    }

    initialize(game, boardElementId = 'knights-tour-board', controlsElementId = 'knights-tour-controls') {
        this.game = game;
        this.boardSize = game.size;
        
        this.boardElement = document.getElementById(boardElementId);
        if (!this.boardElement) {
            throw new Error(`Board element with ID "${boardElementId}" not found`);
        }
        
        const controlsElement = document.getElementById(controlsElementId);
        if (!controlsElement) {
            throw new Error(`Controls element with ID "${controlsElementId}" not found`);
        }
        
        this.createBoardSizeSelector(controlsElement);
        this.createAlgorithmSelector(controlsElement);
        this.createSpeedControl(controlsElement);
        this.createStatusElements(controlsElement);
        this.createActionButtons(controlsElement);
        
        // Start a new game with a random starting position
        this.handleRandomClick();
    }

    handleCellClick(row, col) {
        if (this.isSolving) return;
        
        const success = this.game.makeMove(row, col);
        
        if (success) {
            this.render();
            
            const gameState = this.game.getGameState();
            
            if (!gameState.isGameActive) {
                if (gameState.moveCount === gameState.board.length * gameState.board.length) {
                    this.setMessage('Congratulations! You completed the tour!', 'message-success');
                } else {
                    this.setMessage('Game over! Knight is trapped with no valid moves.', 'message-warning');
                }
                
                this.disableBoard();
            }
        }
    }

    async handleSolveClick() {
        if (this.isSolving) return;
        
        this.isSolving = true;
        this.boardElement.classList.add('solving');
        this.solveButtonElement.disabled = true;
        this.statusElement.textContent = 'Solving...';
        
        try {
            // Get current position
            const startPosition = this.game.startPosition;
            
            // Import the selected algorithm dynamically
            const algorithmModule = await import(
                this.selectedAlgorithm === 'backtracking' 
                ? '../algorithms/backtracking.js' 
                : '../algorithms/warnsdorff.js'
            );
            
            // Execute the algorithm
            const startTime = performance.now();
            const solution = this.selectedAlgorithm === 'backtracking' 
                ? algorithmModule.solveTourBacktracking(this.game.board, startPosition)
                : algorithmModule.solveTourWarnsdorff(this.game.board, startPosition);
            const endTime = performance.now();
            const executionTime = (endTime - startTime) / 1000;
            
            if (solution && solution.length > 0) {
                await this.animateSolution(solution);
                await this.game.saveAlgorithmSolution(this.selectedAlgorithm, solution, executionTime);
                this.showPerformanceMetrics(this.selectedAlgorithm, solution.length, executionTime);
                this.setMessage(`Solution found with ${this.selectedAlgorithm} algorithm!`, 'message-success');
            } else {
                this.setMessage('No solution found!', 'message-error');
            }
        } catch (error) {
            logger.error('Error solving Knight\'s Tour:', error);
            this.setMessage('Error solving Knight\'s Tour', 'message-error');
        } finally {
            this.isSolving = false;
            this.boardElement.classList.remove('solving');
            this.solveButtonElement.disabled = false;
        }
    }

    animateSolution(solution) {
        return new Promise(resolve => {
            let i = 0;
            const game = this.game;
            
            game.reset();
            game.initializeGame(solution[0]);
            
            this.render();
            
            const animateStep = () => {
                i++;
                if (i < solution.length) {
                    const pos = solution[i];
                    game.makeMove(pos.row, pos.col);
                    this.render();
                    setTimeout(animateStep, this.animationSpeed);
                } else {
                    resolve();
                }
            };
            
            setTimeout(animateStep, this.animationSpeed);
        });
    }

    showPerformanceMetrics(algorithm, steps, time) {
        this.metricsElement.style.display = 'block';
        this.metricsElement.innerHTML = `
            <div class="metrics-title">Performance Metrics</div>
            <div class="algorithm-metrics">
                <span class="metrics-label">Algorithm:</span>
                <span>${algorithm === 'backtracking' ? 'Backtracking' : 'Warnsdorff\'s'}</span>
            </div>
            <div class="algorithm-metrics">
                <span class="metrics-label">Steps:</span>
                <span>${steps}</span>
            </div>
            <div class="algorithm-metrics">
                <span class="metrics-label">Execution Time:</span>
                <span>${time.toFixed(3)} seconds</span>
            </div>
            <div class="algorithm-metrics">
                <span class="metrics-label">Steps/Second:</span>
                <span>${(steps / time).toFixed(2)}</span>
            </div>
        `;
    }

    handleResetClick() {
        if (this.isSolving) return;
        
        let startPos = null;
        if (this.game.startPosition) {
            startPos = { ...this.game.startPosition };
        }
        
        this.game.reset();
        this.game.initializeGame(startPos);
        
        this.enableBoard();
        this.clearMessage();
        this.metricsElement.style.display = 'none';
        this.render();
        
        this.setMessage('Game reset successfully.', 'message-info');
    }
    
    handleRandomClick() {
        if (this.isSolving) return;
        
        this.game.reset();
        this.game.initializeGame();
        
        this.enableBoard();
        this.clearMessage();
        this.metricsElement.style.display = 'none';
        this.render();
    }
    
    handleAlgorithmChange(event) {
        this.selectedAlgorithm = event.target.value;
    }
    
    handleSpeedChange(event) {
        this.animationSpeed = parseInt(event.target.value, 10);
    }
    
    async handleBoardSizeChange(event) {
        if (this.isSolving) return;
        
        const newSize = parseInt(event.target.value, 10);
        
        this.game = new KnightsTour(newSize);
        this.boardSize = newSize;
        
        this.game.initializeGame();
        
        this.enableBoard();
        this.clearMessage();
        this.metricsElement.style.display = 'none';
        this.render();
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
        
        const gameState = this.game.getGameState();
        const board = gameState.board;
        const validMoves = gameState.validMoves;
        
        // Create board container
        const boardContainer = document.createElement('div');
        boardContainer.className = 'chess-board';
        boardContainer.style.gridTemplateColumns = `repeat(${this.boardSize}, 1fr)`;
        
        // Create cells
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const cell = document.createElement('div');
                cell.className = `cell ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                // Add coordinate label
                const coordinate = document.createElement('div');
                coordinate.className = 'coordinate';
                coordinate.textContent = this.game.toAlgebraicNotation(row, col);
                cell.appendChild(coordinate);
                
                // Add move number if visited
                if (board[row][col] !== null) {
                    const moveNumber = document.createElement('div');
                    moveNumber.className = 'move-number';
                    moveNumber.textContent = board[row][col];
                    cell.appendChild(moveNumber);
                    cell.classList.add('visited');
                    
                    // Mark start position
                    if (row === gameState.startPosition.row && col === gameState.startPosition.col) {
                        cell.classList.add('start');
                    }
                }
                
                // Add knight to current position
                if (row === gameState.currentPosition.row && col === gameState.currentPosition.col) {
                    const knight = document.createElement('div');
                    knight.className = 'knight';
                    knight.innerHTML = '<i class="fas fa-chess-knight"></i>';
                    cell.appendChild(knight);
                    cell.classList.add('current');
                }
                
                // Mark valid moves
                if (validMoves.some(move => move.row === row && move.col === col)) {
                    cell.classList.add('valid-move');
                    
                    // Add valid move indicator
                    const moveIndicator = document.createElement('div');
                    moveIndicator.className = 'move-indicator';
                    cell.appendChild(moveIndicator);
                }
                
                // Add click event
                cell.addEventListener('click', () => this.handleCellClick(row, col));
                
                boardContainer.appendChild(cell);
            }
        }
        
        this.boardElement.appendChild(boardContainer);
        
        // Update move counter
        this.moveCountElement.textContent = gameState.moveCount;
        
        // Update status message
        if (!gameState.isGameActive) {
            this.statusElement.textContent = gameState.moveCount === gameState.board.length * gameState.board.length
                ? "Tour Completed! 🏆"
                : "No more valid moves! 🛑";
        } else {
            this.statusElement.textContent = "Make your next move";
        }
    }

    createBoardSizeSelector(containerElement) {
        const sizeLabel = document.createElement('label');
        sizeLabel.textContent = 'Board Size: ';
        
        this.boardSizeElement = document.createElement('select');
        
        // Add size options (5x5 to 8x8)
        for (let size = 5; size <= 8; size++) {
            const option = document.createElement('option');
            option.value = size;
            option.textContent = `${size}x${size}`;
            if (size === this.boardSize) option.selected = true;
            this.boardSizeElement.appendChild(option);
        }
        
        this.boardSizeElement.addEventListener('change', this.handleBoardSizeChange);
        
        const controlGroup = document.createElement('div');
        controlGroup.className = 'control-group';
        controlGroup.appendChild(sizeLabel);
        controlGroup.appendChild(this.boardSizeElement);
        containerElement.appendChild(controlGroup);
    }
    
    createAlgorithmSelector(containerElement) {
        const algorithmLabel = document.createElement('label');
        algorithmLabel.textContent = 'Algorithm: ';
        
        this.algorithmSelectElement = document.createElement('select');
        
        const algorithms = [
            { value: 'warnsdorff', text: "Warnsdorff's Algorithm" },
            { value: 'backtracking', text: 'Backtracking Algorithm' }
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
    
    createSpeedControl(containerElement) {
        const speedLabel = document.createElement('label');
        speedLabel.textContent = 'Animation Speed: ';
        
        this.speedControlElement = document.createElement('input');
        this.speedControlElement.type = 'range';
        this.speedControlElement.min = 50;
        this.speedControlElement.max = 1000;
        this.speedControlElement.step = 50;
        this.speedControlElement.value = this.animationSpeed;
        
        this.speedControlElement.addEventListener('input', this.handleSpeedChange);
        
        const controlGroup = document.createElement('div');
        controlGroup.className = 'control-group';
        controlGroup.appendChild(speedLabel);
        controlGroup.appendChild(this.speedControlElement);
        containerElement.appendChild(controlGroup);
    }
    
    createStatusElements(containerElement) {
        // Move counter
        const moveCountContainer = document.createElement('div');
        moveCountContainer.className = 'move-count';
        
        const moveCountLabel = document.createElement('span');
        moveCountLabel.textContent = 'Moves: ';
        moveCountContainer.appendChild(moveCountLabel);
        
        this.moveCountElement = document.createElement('span');
        this.moveCountElement.className = 'count';
        this.moveCountElement.textContent = '0';
        moveCountContainer.appendChild(this.moveCountElement);
        
        containerElement.appendChild(moveCountContainer);
        
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
        
        // Random start button
        this.randomButtonElement = document.createElement('button');
        this.randomButtonElement.className = 'btn btn-info';
        this.randomButtonElement.textContent = 'Random Start';
        this.randomButtonElement.addEventListener('click', this.handleRandomClick);
        buttonContainer.appendChild(this.randomButtonElement);
        
        containerElement.appendChild(buttonContainer);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    const game = new KnightsTour();
    const ui = new KnightsTourUI();
    ui.initialize(game);
});
/**
 * Knight's Tour client-side script
 * This file bundles the game logic and UI components for the browser
 */

// Game state and logic
class KnightsTour {
    constructor(size = 8) {
        this.size = size;
        this.board = this.createEmptyBoard();
        this.currentPosition = null;
        this.startPosition = null;
        this.moveSequence = [];
        this.isGameActive = true;
        this.timer = { start: Date.now() };
    }

    createEmptyBoard() {
        const board = [];
        for (let i = 0; i < this.size; i++) {
            board[i] = new Array(this.size).fill(null);
        }
        return board;
    }

    initializeGame(startPos = null) {
        this.board = this.createEmptyBoard();
        this.moveSequence = [];
        this.isGameActive = true;
        this.timer.start = Date.now();
        
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
        
        return this.startPosition;
    }

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
            return true;
        }
        
        // Check if the knight is trapped (no more valid moves)
        if (this.getValidMoves().length === 0) {
            this.isGameActive = false;
            return true;
        }
        
        return true;
    }

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

    toAlgebraicNotation(row, col) {
        const colLetter = String.fromCharCode(97 + col); // 'a' is ASCII 97
        const rowNumber = this.size - row; // Invert row number (8 for top row in chess)
        return `${colLetter}${rowNumber}`;
    }

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

    reset() {
        this.board = this.createEmptyBoard();
        this.currentPosition = null;
        this.startPosition = null;
        this.moveSequence = [];
        this.isGameActive = true;
    }

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

// UI Component - Extended with our enhanced UI features
class KnightsTourUI {
    constructor() {
        this.game = null;
        this.boardElement = null;
        this.statusElement = null;
        this.moveCountElement = null;
        this.messageElement = null;
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
        
        // Get or create board element
        this.boardElement = document.getElementById(boardElementId);
        if (!this.boardElement) {
            throw new Error(`Board element with ID "${boardElementId}" not found`);
        }
        
        // Get or create controls element
        const controlsElement = document.getElementById(controlsElementId);
        if (!controlsElement) {
            throw new Error(`Controls element with ID "${controlsElementId}" not found`);
        }
        
        // Create board size selector
        this.createBoardSizeSelector(controlsElement);
        
        // Create algorithm selector
        this.createAlgorithmSelector(controlsElement);
        
        // Create animation speed control
        this.createSpeedControl(controlsElement);
        
        // Create status elements
        this.createStatusElements(controlsElement);
        
        // Create action buttons
        this.createActionButtons(controlsElement);
        
        // Add Font Awesome if not already loaded
        this.loadFontAwesome();
        
        // Start a new game with a random starting position
        this.handleRandomClick();
        
        // Initial render
        this.render();
    }
    
    loadFontAwesome() {
        if (!document.getElementById('font-awesome-css')) {
            const link = document.createElement('link');
            link.id = 'font-awesome-css';
            link.rel = 'stylesheet';
            link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
            document.head.appendChild(link);
        }
    }

    createBoardSizeSelector(containerElement) {
        const sizeContainer = document.createElement('div');
        sizeContainer.className = 'control-group';
        
        const sizeLabel = document.createElement('label');
        sizeLabel.textContent = 'Board Size:';
        sizeLabel.setAttribute('for', 'board-size-select');
        
        const sizeSelect = document.createElement('select');
        sizeSelect.id = 'board-size-select';
        sizeSelect.className = 'form-select';
        
        const sizes = [5, 6, 7, 8];
        sizes.forEach(size => {
            const option = document.createElement('option');
            option.value = size;
            option.textContent = `${size}x${size}`;
            if (size === this.boardSize) {
                option.selected = true;
            }
            sizeSelect.appendChild(option);
        });
        
        sizeSelect.addEventListener('change', this.handleBoardSizeChange);
        
        sizeContainer.appendChild(sizeLabel);
        sizeContainer.appendChild(sizeSelect);
        containerElement.appendChild(sizeContainer);
    }
    
    createAlgorithmSelector(containerElement) {
        const algorithmContainer = document.createElement('div');
        algorithmContainer.className = 'control-group';
        
        const algorithmLabel = document.createElement('label');
        algorithmLabel.textContent = 'Algorithm:';
        algorithmLabel.setAttribute('for', 'algorithm-select');
        
        this.algorithmSelectElement = document.createElement('select');
        this.algorithmSelectElement.id = 'algorithm-select';
        this.algorithmSelectElement.className = 'form-select';
        
        const algorithms = [
            { value: 'warnsdorff', text: 'Warnsdorff\'s Heuristic' },
            { value: 'backtracking', text: 'Backtracking Algorithm' }
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
        containerElement.appendChild(algorithmContainer);
    }
    
    createSpeedControl(containerElement) {
        const speedContainer = document.createElement('div');
        speedContainer.className = 'control-group';
        
        const speedLabel = document.createElement('label');
        speedLabel.textContent = 'Animation Speed:';
        speedLabel.setAttribute('for', 'speed-control');
        
        this.speedControlElement = document.createElement('input');
        this.speedControlElement.type = 'range';
        this.speedControlElement.id = 'speed-control';
        this.speedControlElement.className = 'form-range';
        this.speedControlElement.min = '50';
        this.speedControlElement.max = '1000';
        this.speedControlElement.step = '50';
        this.speedControlElement.value = String(this.animationSpeed);
        
        const speedValueDisplay = document.createElement('div');
        speedValueDisplay.className = 'speed-value';
        speedValueDisplay.textContent = `${this.animationSpeed} ms`;
        
        this.speedControlElement.addEventListener('input', (e) => {
            const value = e.target.value;
            speedValueDisplay.textContent = `${value} ms`;
        });
        
        this.speedControlElement.addEventListener('change', this.handleSpeedChange);
        
        speedContainer.appendChild(speedLabel);
        speedContainer.appendChild(this.speedControlElement);
        speedContainer.appendChild(speedValueDisplay);
        containerElement.appendChild(speedContainer);
    }
    
    createStatusElements(containerElement) {
        // Status container
        const statusContainer = document.createElement('div');
        statusContainer.className = 'status-container';
        
        // Move count
        const moveCountContainer = document.createElement('div');
        moveCountContainer.className = 'status-item';
        
        const moveCountLabel = document.createElement('span');
        moveCountLabel.textContent = 'Moves: ';
        
        this.moveCountElement = document.createElement('span');
        this.moveCountElement.className = 'move-count';
        this.moveCountElement.textContent = '1'; // Start with 1 for knight's initial position
        
        moveCountContainer.appendChild(moveCountLabel);
        moveCountContainer.appendChild(this.moveCountElement);
        
        // Status message
        this.statusElement = document.createElement('div');
        this.statusElement.className = 'game-status';
        this.statusElement.textContent = 'Click on a highlighted square to move the knight';
        
        // Message area
        this.messageElement = document.createElement('div');
        this.messageElement.className = 'message-area';
        
        // Performance metrics container
        this.metricsElement = document.createElement('div');
        this.metricsElement.className = 'performance-metrics';
        this.metricsElement.style.display = 'none';
        
        // Add status elements to container
        statusContainer.appendChild(moveCountContainer);
        statusContainer.appendChild(document.createElement('hr'));
        containerElement.appendChild(statusContainer);
        containerElement.appendChild(this.statusElement);
        containerElement.appendChild(this.messageElement);
        containerElement.appendChild(this.metricsElement);
    }
    
    createActionButtons(containerElement) {
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'buttons-container mt-3';
        
        this.solveButtonElement = document.createElement('button');
        this.solveButtonElement.textContent = 'Solve';
        this.solveButtonElement.className = 'btn btn-primary';
        this.solveButtonElement.innerHTML = '<i class="fas fa-magic"></i> Solve';
        this.solveButtonElement.addEventListener('click', this.handleSolveClick);
        
        this.resetButtonElement = document.createElement('button');
        this.resetButtonElement.textContent = 'Reset';
        this.resetButtonElement.className = 'btn btn-secondary';
        this.resetButtonElement.innerHTML = '<i class="fas fa-redo"></i> Reset';
        this.resetButtonElement.addEventListener('click', this.handleResetClick);
        
        this.randomButtonElement = document.createElement('button');
        this.randomButtonElement.textContent = 'Random Start';
        this.randomButtonElement.className = 'btn btn-info';
        this.randomButtonElement.innerHTML = '<i class="fas fa-random"></i> Random Start';
        this.randomButtonElement.addEventListener('click', this.handleRandomClick);
        
        buttonsContainer.appendChild(this.solveButtonElement);
        buttonsContainer.appendChild(this.resetButtonElement);
        buttonsContainer.appendChild(this.randomButtonElement);
        containerElement.appendChild(buttonsContainer);
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
            
            // Call the server-side algorithm API
            this.setMessage('Requesting solution from server...', 'message-info');
            
            const startTime = performance.now();
            const response = await fetch('/api/games/knights-tour/solve', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    startPosition,
                    boardSize: this.game.size,
                    algorithm: this.selectedAlgorithm
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to solve Knight\'s Tour');
            }
            
            const result = await response.json();
            const endTime = performance.now();
            const clientTime = (endTime - startTime) / 1000; // Client-side time in seconds
            
            // Display solution if found
            if (result.solution && result.solution.length > 0) {
                await this.animateSolution(result.solution);
                
                // Use server-reported execution time for metrics
                this.showPerformanceMetrics(this.selectedAlgorithm, result.solution.length, result.executionTime);
                this.setMessage(`Solution found with ${this.selectedAlgorithm} algorithm! (Server processed in ${result.executionTime.toFixed(3)}s)`, 'message-success');
            } else {
                this.setMessage('No solution found!', 'message-error');
            }
        } catch (error) {
            console.error('Error solving Knight\'s Tour:', error);
            this.setMessage(`Error solving Knight\'s Tour: ${error.message}`, 'message-error');
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
            
            // Reset game to starting position
            game.reset();
            game.initializeGame(solution[0]);
            
            // Draw initial board
            this.render();
            
            // Animate moves
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
        `;
    }
    
    handleResetClick() {
        if (this.isSolving) return;
        
        // Store the current position before reset if available, otherwise use random
        let startPos = null;
        if (this.game.startPosition) {
            startPos = { ...this.game.startPosition };
        }
        
        this.game.reset();
        
        // Initialize with the stored position or a new random position
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
        
        // Create new game with new size
        this.game = new KnightsTour(newSize);
        this.boardSize = newSize;
        
        // Initialize the new game
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
        this.solveButtonElement.disabled = true;
    }
    
    enableBoard() {
        this.boardElement.classList.remove('disabled');
        this.solveButtonElement.disabled = false;
    }
    
    render() {
        // Clear board
        this.boardElement.innerHTML = '';
        
        // Get game state
        const gameState = this.game.getGameState();
        const validMoves = gameState.validMoves || [];
        
        // Create chess board
        const board = document.createElement('div');
        board.className = 'chess-board';
        board.style.gridTemplateColumns = `repeat(${this.game.size}, 1fr)`;
        
        // Create board cells
        for (let row = 0; row < gameState.board.length; row++) {
            for (let col = 0; col < gameState.board[row].length; col++) {
                const cell = document.createElement('div');
                
                // Set cell color (light/dark)
                const isLightSquare = (row + col) % 2 === 0;
                cell.className = `cell ${isLightSquare ? 'light' : 'dark'}`;
                
                // Add coordinate label
                const coordinate = document.createElement('div');
                coordinate.className = 'coordinate';
                coordinate.textContent = this.game.toAlgebraicNotation(row, col);
                cell.appendChild(coordinate);
                
                // Add move number if visited
                const moveNumber = gameState.board[row][col];
                if (moveNumber !== null) {
                    const moveNumberElement = document.createElement('div');
                    moveNumberElement.className = 'move-number';
                    moveNumberElement.textContent = moveNumber;
                    cell.appendChild(moveNumberElement);
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
                const isValidMove = validMoves.some(move => move.row === row && move.col === col);
                if (isValidMove) {
                    cell.classList.add('valid-move');
                    
                    // Add valid move indicator
                    const moveIndicator = document.createElement('div');
                    moveIndicator.className = 'move-indicator';
                    cell.appendChild(moveIndicator);
                }
                
                // Add click event
                cell.addEventListener('click', () => this.handleCellClick(row, col));
                
                board.appendChild(cell);
            }
        }
        
        this.boardElement.appendChild(board);
        
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
}

// Initialize game when DOM content is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create game instance and UI controller
    const game = new KnightsTour(8);
    const ui = new KnightsTourUI();
    
    // Initialize UI with game
    ui.initialize(game);
});
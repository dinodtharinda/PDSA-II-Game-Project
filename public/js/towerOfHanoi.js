/**
 * Tower of Hanoi game client-side script
 * This file handles the UI components for the Tower of Hanoi game
 * The algorithms are now implemented on the server side for better performance
 */

// Game state and logic
class TowerOfHanoi {
    constructor() {
        // Initialize with default values
        this.diskCount = this.getRandomDiskCount();
        this.pegCount = 3; // Default to 3 pegs
        this.reset();
        
        // Performance tracking
        this.moveCount = 0;
        this.optimalMoveCount = 0;
        
        // Algorithm selection
        this.selectedAlgorithm = 'recursive';
        
        // Game state
        this.isGameActive = true;
    }

    /**
     * Reset the game with current settings
     */
    reset() {
        // Create the pegs
        this.pegs = Array(this.pegCount).fill().map(() => []);
        
        // Initialize the first peg with all disks in descending order (largest at bottom)
        for (let i = this.diskCount; i >= 1; i--) {
            this.pegs[0].push(i);
        }
        
        this.moveCount = 0;
        this.moveSequence = [];
        this.isGameActive = true;
        this.startTime = new Date();
        
        // Calculate optimal move count based on algorithm and peg count
        this.calculateOptimalMoveCount();
        
        console.log(`Tower of Hanoi game reset with ${this.diskCount} disks and ${this.pegCount} pegs`);
    }

    /**
     * Generate a random disk count between 5 and 10
     */
    getRandomDiskCount() {
        return Math.floor(Math.random() * 6) + 5; // 5-10 disks
    }

    /**
     * Set the number of disks
     * @param {number} count - Number of disks (5-10)
     */
    setDiskCount(count) {
        if (count < 5 || count > 10) {
            throw new Error('Disk count must be between 5 and 10');
        }
        this.diskCount = count;
        this.reset();
    }

    /**
     * Set the number of pegs (3 or 4)
     * @param {number} count - Number of pegs (3-4)
     */
    setPegCount(count) {
        if (count !== 3 && count !== 4) {
            throw new Error('Peg count must be either 3 or 4');
        }
        this.pegCount = count;
        this.reset();
    }

    /**
     * Set the algorithm to use for solution
     * @param {string} algorithm - Algorithm name ('recursive', 'iterative', or 'frameStewart')
     */
    setAlgorithm(algorithm) {
        const validAlgorithms = ['recursive', 'iterative', 'frameStewart'];
        if (!validAlgorithms.includes(algorithm)) {
            throw new Error(`Invalid algorithm. Must be one of: ${validAlgorithms.join(', ')}`);
        }
        
        // Frame-Stewart only works with 4 pegs
        if (algorithm === 'frameStewart' && this.pegCount !== 4) {
            throw new Error('Frame-Stewart algorithm requires 4 pegs');
        }
        
        this.selectedAlgorithm = algorithm;
        this.calculateOptimalMoveCount();
    }

    /**
     * Calculate the optimal move count based on algorithm and peg configuration
     */
    calculateOptimalMoveCount() {
        if (this.pegCount === 3) {
            // For 3 pegs, optimal solution is always 2^n - 1 moves
            this.optimalMoveCount = Math.pow(2, this.diskCount) - 1;
        } else if (this.pegCount === 4) {
            if (this.selectedAlgorithm === 'frameStewart') {
                // For 4 pegs with Frame-Stewart algorithm, calculations are more complex
                // This is an approximation based on the algorithm
                const k = Math.floor(Math.sqrt(2 * this.diskCount));
                let moveCount = Math.pow(2, this.diskCount - k) - 1 + 2 * Math.pow(2, k) - 1;
                this.optimalMoveCount = moveCount;
            } else {
                // Default to 3-peg algorithm optimal count for comparison
                this.optimalMoveCount = Math.pow(2, this.diskCount) - 1;
            }
        }
    }

    /**
     * Move a disk from one peg to another
     * @param {number} fromPeg - Source peg index (0-based)
     * @param {number} toPeg - Destination peg index (0-based)
     * @returns {boolean} - Whether the move was valid and executed
     */
    moveDisk(fromPeg, toPeg) {
        // Validate move
        if (!this.isValidMove(fromPeg, toPeg)) {
            return false;
        }
        
        // Execute move
        const disk = this.pegs[fromPeg].pop();
        this.pegs[toPeg].push(disk);
        
        // Record move
        this.moveCount++;
        this.moveSequence.push({ from: fromPeg, to: toPeg, disk });
        
        // Check if game is complete
        if (this.isGameComplete()) {
            this.endGame();
        }
        
        return true;
    }

    /**
     * Check if a move is valid
     * @param {number} fromPeg - Source peg index (0-based)
     * @param {number} toPeg - Destination peg index (0-based)
     * @returns {boolean} - Whether the move is valid
     */
    isValidMove(fromPeg, toPeg) {
        // Check if pegs are in range
        if (fromPeg < 0 || fromPeg >= this.pegCount || toPeg < 0 || toPeg >= this.pegCount) {
            return false;
        }
        
        // Check if source peg has disks
        if (this.pegs[fromPeg].length === 0) {
            return false;
        }
        
        // Check if destination peg can accept the disk (smaller disk on top of larger disk)
        const diskToMove = this.pegs[fromPeg][this.pegs[fromPeg].length - 1];
        if (this.pegs[toPeg].length > 0) {
            const topDiskAtDestination = this.pegs[toPeg][this.pegs[toPeg].length - 1];
            if (diskToMove > topDiskAtDestination) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * Check if the game is complete (all disks moved to the last peg)
     * @returns {boolean} - Whether the game is complete
     */
    isGameComplete() {
        return this.pegs[this.pegCount - 1].length === this.diskCount;
    }

    /**
     * End the game and record statistics
     */
    endGame() {
        this.isGameActive = false;
        const endTime = new Date();
        const durationMs = endTime - this.startTime;
        
        console.log(`Tower of Hanoi game completed in ${this.moveCount} moves (optimal: ${this.optimalMoveCount})`);
        
        // In the client-side version, we don't save to database directly
        // Instead, we'll display a completion message
        
        return {
            moveCount: this.moveCount,
            optimalMoveCount: this.optimalMoveCount,
            duration: durationMs / 1000 // in seconds
        };
    }

    /**
     * Get the solution from server for the current configuration
     * @returns {Promise<Object>} - Promise resolving to solution object
     */
    async getSolution() {
        try {
            const response = await fetch('/api/games/tower-of-hanoi/solve', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    diskCount: this.diskCount,
                    pegCount: this.pegCount,
                    algorithm: this.selectedAlgorithm
                })
            });

            if (!response.ok) {
                throw new Error('Server error');
            }

            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Failed to get solution');
            }
            
            return {
                moves: data.moves,
                executionTime: data.executionTime,
                moveCount: data.moveCount,
                algorithm: data.algorithm
            };
        } catch (error) {
            console.error('Error getting solution:', error);
            throw error;
        }
    }

    /**
     * Get current game state
     * @returns {Object} - Game state object
     */
    getGameState() {
        return {
            diskCount: this.diskCount,
            pegCount: this.pegCount,
            pegs: this.pegs.map(peg => [...peg]), // Create deep copy
            moveCount: this.moveCount,
            optimalMoveCount: this.optimalMoveCount,
            isGameComplete: this.isGameComplete(),
            isGameActive: this.isGameActive,
            selectedAlgorithm: this.selectedAlgorithm
        };
    }
}

// UI Component
class TowerOfHanoiUI {
    constructor() {
        this.game = new TowerOfHanoi();
        this.selectedPeg = null;
        this.isSolving = false;
        
        // DOM elements
        this.boardElement = null;
        this.moveCountElement = null;
        this.messageElement = null;
        this.algorithmSelectElement = null;
        this.pegCountSelectElement = null;
        this.diskCountSelectElement = null;
        this.solutionButtonElement = null;
        this.resetButtonElement = null;
        
        // Bind event handlers
        this.handlePegClick = this.handlePegClick.bind(this);
        this.handleSolutionClick = this.handleSolutionClick.bind(this);
        this.handleResetClick = this.handleResetClick.bind(this);
        this.handleAlgorithmChange = this.handleAlgorithmChange.bind(this);
        this.handlePegCountChange = this.handlePegCountChange.bind(this);
        this.handleDiskCountChange = this.handleDiskCountChange.bind(this);
    }

    /**
     * Initialize the UI components and attach event handlers
     * @param {string} boardElementId - ID of the board container element
     * @param {string} controlsElementId - ID of the controls container element
     */
    initialize(boardElementId = 'tower-of-hanoi-board', controlsElementId = 'tower-of-hanoi-controls') {
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
        
        // Create controls
        this.createControls(controlsElement);
        
        // Create status elements
        this.createStatusElements(controlsElement);
        
        // Render initial state
        this.render();
    }

    /**
     * Create game controls
     * @param {HTMLElement} containerElement - Container for controls
     */
    createControls(containerElement) {
        // Create algorithm selector
        const algorithmContainer = document.createElement('div');
        algorithmContainer.className = 'control-group';
        
        const algorithmLabel = document.createElement('label');
        algorithmLabel.textContent = 'Algorithm:';
        algorithmLabel.setAttribute('for', 'toh-algorithm-select');
        
        this.algorithmSelectElement = document.createElement('select');
        this.algorithmSelectElement.id = 'toh-algorithm-select';
        
        const algorithms = [
            { value: 'recursive', text: 'Recursive' },
            { value: 'iterative', text: 'Iterative' },
            { value: 'frameStewart', text: 'Frame-Stewart (4 pegs only)' }
        ];
        
        algorithms.forEach(algorithm => {
            const option = document.createElement('option');
            option.value = algorithm.value;
            option.textContent = algorithm.text;
            if (algorithm.value === this.game.selectedAlgorithm) {
                option.selected = true;
            }
            this.algorithmSelectElement.appendChild(option);
        });
        
        this.algorithmSelectElement.addEventListener('change', this.handleAlgorithmChange);
        
        algorithmContainer.appendChild(algorithmLabel);
        algorithmContainer.appendChild(this.algorithmSelectElement);
        
        // Create peg count selector
        const pegCountContainer = document.createElement('div');
        pegCountContainer.className = 'control-group';
        
        const pegCountLabel = document.createElement('label');
        pegCountLabel.textContent = 'Number of Pegs:';
        pegCountLabel.setAttribute('for', 'toh-peg-count-select');
        
        this.pegCountSelectElement = document.createElement('select');
        this.pegCountSelectElement.id = 'toh-peg-count-select';
        
        [3, 4].forEach(count => {
            const option = document.createElement('option');
            option.value = count;
            option.textContent = count;
            if (count === this.game.pegCount) {
                option.selected = true;
            }
            this.pegCountSelectElement.appendChild(option);
        });
        
        this.pegCountSelectElement.addEventListener('change', this.handlePegCountChange);
        
        pegCountContainer.appendChild(pegCountLabel);
        pegCountContainer.appendChild(this.pegCountSelectElement);
        
        // Create disk count selector
        const diskCountContainer = document.createElement('div');
        diskCountContainer.className = 'control-group';
        
        const diskCountLabel = document.createElement('label');
        diskCountLabel.textContent = 'Number of Disks:';
        diskCountLabel.setAttribute('for', 'toh-disk-count-select');
        
        this.diskCountSelectElement = document.createElement('select');
        this.diskCountSelectElement.id = 'toh-disk-count-select';
        
        for (let i = 5; i <= 10; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            if (i === this.game.diskCount) {
                option.selected = true;
            }
            this.diskCountSelectElement.appendChild(option);
        }
        
        this.diskCountSelectElement.addEventListener('change', this.handleDiskCountChange);
        
        diskCountContainer.appendChild(diskCountLabel);
        diskCountContainer.appendChild(this.diskCountSelectElement);
        
        // Create solution button
        this.solutionButtonElement = document.createElement('button');
        this.solutionButtonElement.textContent = 'Show Solution';
        this.solutionButtonElement.className = 'btn btn-primary';
        this.solutionButtonElement.addEventListener('click', this.handleSolutionClick);
        
        // Create reset button
        this.resetButtonElement = document.createElement('button');
        this.resetButtonElement.textContent = 'Reset Game';
        this.resetButtonElement.className = 'btn btn-secondary';
        this.resetButtonElement.addEventListener('click', this.handleResetClick);
        
        // Add controls to container
        containerElement.appendChild(algorithmContainer);
        containerElement.appendChild(pegCountContainer);
        containerElement.appendChild(diskCountContainer);
        containerElement.appendChild(document.createElement('br'));
        containerElement.appendChild(this.solutionButtonElement);
        containerElement.appendChild(this.resetButtonElement);
    }

    /**
     * Create status elements
     * @param {HTMLElement} containerElement - Container for status elements
     */
    createStatusElements(containerElement) {
        const statusContainer = document.createElement('div');
        statusContainer.className = 'status-container';
        
        // Move count
        const moveCountContainer = document.createElement('div');
        moveCountContainer.className = 'status-item';
        
        const moveCountLabel = document.createElement('span');
        moveCountLabel.textContent = 'Moves: ';
        
        this.moveCountElement = document.createElement('span');
        this.moveCountElement.className = 'move-count';
        this.moveCountElement.textContent = '0';
        
        moveCountContainer.appendChild(moveCountLabel);
        moveCountContainer.appendChild(this.moveCountElement);
        
        // Message area
        this.messageElement = document.createElement('div');
        this.messageElement.className = 'message-area';
        
        // Add status elements to container
        statusContainer.appendChild(moveCountContainer);
        statusContainer.appendChild(this.messageElement);
        
        containerElement.appendChild(document.createElement('hr'));
        containerElement.appendChild(statusContainer);
    }

    /**
     * Render the game board
     */
    render() {
        // Clear board
        this.boardElement.innerHTML = '';
        
        // Create container for pegs
        const pegsContainer = document.createElement('div');
        pegsContainer.className = 'pegs-container';
        
        // Add solving class if currently solving
        if (this.isSolving) {
            pegsContainer.classList.add('solving');
        }
        
        // Get game state
        const gameState = this.game.getGameState();
        
        // Create pegs
        for (let i = 0; i < gameState.pegCount; i++) {
            // Create peg container
            const pegContainer = document.createElement('div');
            pegContainer.className = 'peg-container';
            pegContainer.dataset.pegIndex = i;
            
            // Add click event to peg
            pegContainer.addEventListener('click', () => this.handlePegClick(i));
            
            // Create peg
            const peg = document.createElement('div');
            peg.className = 'peg';
            
            // Add selected class if this peg is selected
            if (i === this.selectedPeg) {
                pegContainer.classList.add('selected');
            }
            
            // Create disks container
            const disksContainer = document.createElement('div');
            disksContainer.className = 'disks-container';
            
            // Add disks to the peg
            const disks = gameState.pegs[i];
            disks.forEach(diskSize => {
                const disk = document.createElement('div');
                disk.className = 'disk';
                disk.style.width = `${40 + (diskSize * 15)}px`;
                disk.dataset.size = diskSize;
                disksContainer.appendChild(disk);
            });
            
            // Assemble peg
            pegContainer.appendChild(disksContainer);
            pegContainer.appendChild(peg);
            
            // Add peg label
            const pegLabel = document.createElement('div');
            pegLabel.className = 'peg-label';
            pegLabel.textContent = `Peg ${i + 1}`;
            pegContainer.appendChild(pegLabel);
            
            // Add peg to container
            pegsContainer.appendChild(pegContainer);
        }
        
        // Add pegs to board
        this.boardElement.appendChild(pegsContainer);
        
        // Update move count display
        this.moveCountElement.textContent = gameState.moveCount;
        
        // Check if game is complete
        if (gameState.isGameComplete) {
            this.showMessage(`Congratulations! You completed the puzzle in ${gameState.moveCount} moves. Optimal solution requires ${gameState.optimalMoveCount} moves.`, 'success');
        }
    }

    /**
     * Handle peg click event
     * @param {number} pegIndex - Index of the clicked peg
     */
    handlePegClick(pegIndex) {
        if (!this.game.isGameActive || this.isSolving) {
            return;
        }
        
        if (this.selectedPeg === null) {
            // First selection - select a peg with disks
            if (this.game.pegs[pegIndex].length > 0) {
                this.selectedPeg = pegIndex;
                this.render();
            } else {
                this.showMessage('Select a peg with disks', 'error');
            }
        } else {
            // Second selection - attempt to move disk
            const fromPeg = this.selectedPeg;
            const toPeg = pegIndex;
            
            if (fromPeg === toPeg) {
                // Deselect if same peg clicked
                this.selectedPeg = null;
                this.render();
                return;
            }
            
            // Attempt to move disk
            const moveSuccessful = this.game.moveDisk(fromPeg, toPeg);
            
            if (moveSuccessful) {
                this.selectedPeg = null;
                this.render();
            } else {
                this.showMessage('Invalid move. A disk can only be placed on an empty peg or on a larger disk.', 'error');
            }
        }
    }

    /**
     * Handle solution button click event
     */
    async handleSolutionClick() {
        if (this.isSolving) return;
        
        try {
            // Show solving state
            this.isSolving = true;
            this.disableControls();
            this.showMessage('Calculating solution...', 'info');
            this.render();
            
            // Get solution from server
            const solution = await this.game.getSolution();
            
            // Display solution info
            this.showMessage(`Solution found with ${solution.moveCount} moves in ${solution.executionTime.toFixed(3)} seconds using ${solution.algorithm} algorithm.`, 'info');
            
            // Reset game to animate solution
            this.game.reset();
            this.selectedPeg = null;
            this.render();
            
            // Animate solution
            this.animateSolution(solution.moves);
        } catch (error) {
            this.showMessage(`Error finding solution: ${error.message}`, 'error');
            this.isSolving = false;
            this.enableControls();
        }
    }

    /**
     * Animate the solution
     * @param {Array} moves - Array of moves to animate
     */
    animateSolution(moves) {
        let moveIndex = 0;
        
        const animateNextMove = () => {
            if (moveIndex >= moves.length) {
                // Animation complete
                this.isSolving = false;
                this.enableControls();
                this.render();
                return;
            }
            
            const move = moves[moveIndex];
            
            // Execute move
            this.game.moveDisk(move.from, move.to);
            
            // Render board
            this.render();
            
            // Schedule next move
            moveIndex++;
            setTimeout(animateNextMove, 500);
        };
        
        // Start animation
        setTimeout(animateNextMove, 500);
    }

    /**
     * Disable controls during solution animation
     */
    disableControls() {
        this.solutionButtonElement.disabled = true;
        this.resetButtonElement.disabled = true;
        this.algorithmSelectElement.disabled = true;
        this.pegCountSelectElement.disabled = true;
        this.diskCountSelectElement.disabled = true;
    }

    /**
     * Enable controls after solution animation
     */
    enableControls() {
        this.solutionButtonElement.disabled = false;
        this.resetButtonElement.disabled = false;
        this.algorithmSelectElement.disabled = false;
        this.pegCountSelectElement.disabled = false;
        this.diskCountSelectElement.disabled = false;
    }

    /**
     * Handle reset button click event
     */
    handleResetClick() {
        if (this.isSolving) return;
        
        this.game.reset();
        this.selectedPeg = null;
        this.clearMessage();
        this.render();
    }

    /**
     * Handle algorithm change event
     */
    handleAlgorithmChange() {
        if (this.isSolving) return;
        
        try {
            const algorithm = this.algorithmSelectElement.value;
            this.game.setAlgorithm(algorithm);
            
            // Enable 4 pegs if Frame-Stewart selected
            if (algorithm === 'frameStewart') {
                this.pegCountSelectElement.value = '4';
                this.handlePegCountChange();
            }
            
            this.render();
        } catch (error) {
            this.showMessage(`Error changing algorithm: ${error.message}`, 'error');
            // Reset select to current algorithm
            this.algorithmSelectElement.value = this.game.selectedAlgorithm;
        }
    }

    /**
     * Handle peg count change event
     */
    handlePegCountChange() {
        if (this.isSolving) return;
        
        try {
            const pegCount = parseInt(this.pegCountSelectElement.value, 10);
            this.game.setPegCount(pegCount);
            
            // Disable Frame-Stewart if 3 pegs selected
            if (pegCount === 3 && this.game.selectedAlgorithm === 'frameStewart') {
                this.algorithmSelectElement.value = 'recursive';
                this.handleAlgorithmChange();
            }
            
            this.selectedPeg = null;
            this.clearMessage();
            this.render();
        } catch (error) {
            this.showMessage(`Error changing peg count: ${error.message}`, 'error');
            // Reset select to current peg count
            this.pegCountSelectElement.value = this.game.pegCount;
        }
    }

    /**
     * Handle disk count change event
     */
    handleDiskCountChange() {
        if (this.isSolving) return;
        
        try {
            const diskCount = parseInt(this.diskCountSelectElement.value, 10);
            this.game.setDiskCount(diskCount);
            this.selectedPeg = null;
            this.clearMessage();
            this.render();
        } catch (error) {
            this.showMessage(`Error changing disk count: ${error.message}`, 'error');
            // Reset select to current disk count
            this.diskCountSelectElement.value = this.game.diskCount;
        }
    }

    /**
     * Show a message to the user
     * @param {string} message - Message text
     * @param {string} type - Message type ('info', 'success', 'warning', 'error')
     */
    showMessage(message, type = 'info') {
        this.messageElement.textContent = message;
        this.messageElement.className = `message-area message-${type}`;
    }

    /**
     * Clear any displayed message
     */
    clearMessage() {
        this.messageElement.textContent = '';
        this.messageElement.className = 'message-area';
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const ui = new TowerOfHanoiUI();
    ui.initialize();
    
    // Export for debugging
    window.TowerOfHanoi = TowerOfHanoi;
    window.TowerOfHanoiUI = ui;
});
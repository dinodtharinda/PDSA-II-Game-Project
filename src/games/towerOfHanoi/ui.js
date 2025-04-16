/**
 * Tower of Hanoi UI Components
 * 
 * This file contains the UI components for the Tower of Hanoi puzzle.
 * It handles rendering of the game board, disks, and user interactions.
 */

const TowerOfHanoi = require('./game');

class TowerOfHanoiUI {
    constructor() {
        this.game = new TowerOfHanoi();
        this.selectedPeg = null;
        
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
        if (!this.game.isGameActive) {
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
    handleSolutionClick() {
        try {
            // Get solution
            const solution = this.game.getSolution();
            
            // Display solution info
            this.showMessage(`Solution found with ${solution.moveCount} moves in ${solution.executionTime.toFixed(3)} seconds using ${this.game.selectedAlgorithm} algorithm.`, 'info');
            
            // Reset game to animate solution
            this.game.reset();
            this.selectedPeg = null;
            this.render();
            
            // Animate solution
            this.animateSolution(solution.moves);
        } catch (error) {
            this.showMessage(`Error finding solution: ${error.message}`, 'error');
        }
    }

    /**
     * Animate the solution
     * @param {Array} moves - Array of moves to animate
     */
    animateSolution(moves) {
        // Disable controls during animation
        this.disableControls();
        
        let moveIndex = 0;
        
        const animateNextMove = () => {
            if (moveIndex >= moves.length) {
                // Animation complete
                this.enableControls();
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
        this.game.reset();
        this.selectedPeg = null;
        this.clearMessage();
        this.render();
    }

    /**
     * Handle algorithm change event
     */
    handleAlgorithmChange() {
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

module.exports = TowerOfHanoiUI;
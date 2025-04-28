/**
 * Tower of Hanoi UI Module
 * Handles the user interface and interactions for the Tower of Hanoi puzzle
 */

import Timer from '../../../utils/timer.js';
import logger from '../../../utils/logger.js';
import TowerOfHanoi from '../game.js';

// Helper function to resolve asset URLs correctly
function resolveAssetUrl(path) {
    // Get base URL from the current page location
    const baseUrl = window.location.origin;
    // Remove any leading slash to avoid double slashes
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${baseUrl}/${cleanPath}`;
}

export class TowerOfHanoiUI {
    constructor() {
        this.game = null;
        
        // DOM elements
        this.gameElement = null;
        this.towerElement = null;
        this.statusElement = null;
        this.messageElement = null;
        this.moveCountElement = null;
        this.algorithmSelectElement = null;
        this.diskCountSelectElement = null;
        this.pegCountSelectElement = null;
        this.solveButtonElement = null;
        this.resetButtonElement = null;
        this.metricsElement = null;
        
        // Game state
        this.selectedDisk = null;
        this.isSolving = false;
        this.playerName = '';
        this.draggedDisk = null;
        this.draggedDiskElement = null;
        this.isGameComplete = false; // Add tracking for game completion
        
        // Bind event handlers
        this.handleDiskClick = this.handleDiskClick.bind(this);
        this.handlePegClick = this.handlePegClick.bind(this);
        this.handleSolveClick = this.handleSolveClick.bind(this);
        this.handleResetClick = this.handleResetClick.bind(this);
        this.handleAlgorithmChange = this.handleAlgorithmChange.bind(this);
        this.handleDiskCountChange = this.handleDiskCountChange.bind(this);
        this.handlePegCountChange = this.handlePegCountChange.bind(this);
        this.handleDiskDragStart = this.handleDiskDragStart.bind(this);
        this.handleDiskDragEnd = this.handleDiskDragEnd.bind(this);
        this.handlePegDragOver = this.handlePegDragOver.bind(this);
        this.handlePegDrop = this.handlePegDrop.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
    }

    async initialize(game, boardElementId = 'tower-of-hanoi-board', controlsElementId = 'tower-of-hanoi-controls') {
        console.log('TowerOfHanoiUI initialize called with:', boardElementId, controlsElementId);
        
        this.game = game;
        
        // Find the board element - try both the provided ID and the fallback 'tower-of-hanoi-game' ID
        this.gameElement = document.getElementById(boardElementId);
        if (!this.gameElement) {
            // Try alternate ID
            this.gameElement = document.getElementById('tower-of-hanoi-game');
            if (!this.gameElement) {
                console.error(`Game board element with ID "${boardElementId}" or "tower-of-hanoi-game" not found in the DOM`);
                
                // Create the element if it doesn't exist
                this.gameElement = document.createElement('div');
                this.gameElement.id = boardElementId;
                this.gameElement.className = 'game-board';
                
                // Try to append it to a reasonable location in the document
                const container = document.querySelector('.game-container') || document.querySelector('.container');
                if (container) {
                    container.appendChild(this.gameElement);
                    console.log('Created new game board element:', boardElementId);
                } else {
                    document.body.appendChild(this.gameElement);
                    console.log('Created new game board element in body:', boardElementId);
                }
            } else {
                console.log('Found alternate game board element ID: tower-of-hanoi-game');
            }
        }
        
        // Find or create controls element
        let controlsElement = document.getElementById(controlsElementId);
        if (!controlsElement) {
            controlsElement = document.createElement('div');
            controlsElement.id = controlsElementId;
            controlsElement.className = 'game-controls';
            
            // Try to append it after the game element
            if (this.gameElement.parentNode) {
                this.gameElement.parentNode.insertBefore(controlsElement, this.gameElement.nextSibling);
                console.log('Created new controls element:', controlsElementId);
            } else {
                document.body.appendChild(controlsElement);
                console.log('Created new controls element in body:', controlsElementId);
            }
        }
        
        // Get or create status element
        this.statusElement = document.getElementById('tower-of-hanoi-status');
        if (!this.statusElement) {
            this.statusElement = document.createElement('div');
            this.statusElement.id = 'tower-of-hanoi-status';
            this.statusElement.className = 'game-status';
            const container = document.querySelector('.container');
            if (container) {
                container.appendChild(this.statusElement);
            } else if (this.gameElement.parentNode) {
                this.gameElement.parentNode.appendChild(this.statusElement);
            }
        }
        
        // Clear controls container before adding new ones
        controlsElement.innerHTML = '';

        // Create game controls
        this.createGameControls(controlsElement);
        this.createStatusElements(controlsElement);
        this.createActionButtons(controlsElement);
        
        // Clear and create the tower element
        this.gameElement.innerHTML = '';
        this.towerElement = document.createElement('div');
        this.towerElement.className = 'tower-of-hanoi';
        this.gameElement.appendChild(this.towerElement);
        
        // Create CSS for the game
        this.createGameStyles();
        
        // Add game instructions
        this.addGameInstructions();
        
        // Render the initial board
        this.render();
        
        return this;
    }

    // Add method to create game-specific styles
    createGameStyles() {
        // Check if styles already exist
        if (document.getElementById('tower-of-hanoi-styles')) {
            return;
        }
        
        const style = document.createElement('style');
        style.id = 'tower-of-hanoi-styles';
        style.textContent = `
            .tower-of-hanoi {
                display: flex;
                justify-content: space-around;
                align-items: flex-end;
                width: 100%;
                height: 350px;
                margin: 20px 0;
                background-color: #f5f5f5;
                border-radius: 10px;
                padding: 20px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                position: relative;
                touch-action: none; /* Prevents default touch actions for better dragging */
            }
            
            .peg-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: flex-end;
                height: 100%;
                width: 30%;
                position: relative;
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .peg-container.drag-over {
                background-color: rgba(0, 123, 255, 0.2);
                border-radius: 8px;
            }
            
            .peg-container:hover {
                background-color: rgba(0, 123, 255, 0.05);
                border-radius: 8px;
            }
            
            .peg-container.selected {
                background-color: rgba(0, 123, 255, 0.1);
                border-radius: 10px;
            }
            
            .peg {
                width: 12px;
                height: 220px;
                background-color: #8b4513;
                border-radius: 4px;
                position: absolute;
                bottom: 40px;
                z-index: 1;
            }
            
            .base {
                width: 80%;
                height: 20px;
                background-color: #a0522d;
                border-radius: 8px;
                position: absolute;
                bottom: 20px;
                z-index: 2;
            }
            
            .disk {
                height: 20px;
                margin: 1px 0;
                border-radius: 10px;
                text-align: center;
                color: white;
                font-weight: bold;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                display: flex;
                align-items: center;
                justify-content: center;
                position: absolute;
                z-index: 3;
                transition: all 0.3s;
                cursor: grab;
                user-select: none;
                touch-action: none;
            }
            
            /* Vibrant colors for different disk sizes */
            .disk-1 { width: 50px; background: linear-gradient(to right, #FF5252, #B71C1C); }
            .disk-2 { width: 65px; background: linear-gradient(to right, #FF9800, #E65100); }
            .disk-3 { width: 80px; background: linear-gradient(to right, #FFEB3B, #F57F17); }
            .disk-4 { width: 95px; background: linear-gradient(to right, #4CAF50, #1B5E20); }
            .disk-5 { width: 110px; background: linear-gradient(to right, #2196F3, #0D47A1); }
            .disk-6 { width: 125px; background: linear-gradient(to right, #673AB7, #311B92); }
            .disk-7 { width: 140px; background: linear-gradient(to right, #9C27B0, #4A148C); }
            .disk-8 { width: 155px; background: linear-gradient(to right, #E91E63, #880E4F); }
            .disk-9 { width: 170px; background: linear-gradient(to right, #009688, #004D40); }
            .disk-10 { width: 185px; background: linear-gradient(to right, #607D8B, #263238); }
            
            .disk.dragging {
                opacity: 0.8;
                transform: scale(1.05);
                cursor: grabbing;
                z-index: 100;
                box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
            }
            
            .disk.selected {
                transform: translateY(-10px);
                box-shadow: 0 6px 10px rgba(0, 0, 0, 0.3);
                filter: brightness(1.2);
            }

            /* Celebration effects for game completion */
            @keyframes celebrate {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
            
            .game-complete .disk {
                animation: celebrate 0.8s ease-in-out infinite;
                animation-delay: calc(var(--disk-index) * 0.1s);
            }
            
            .game-complete-banner {
                position: absolute;
                top: 40%;
                left: 50%;
                transform: translate(-50%, -50%);
                background-color: rgba(76, 175, 80, 0.9);
                color: white;
                padding: 15px 30px;
                border-radius: 10px;
                font-size: 24px;
                font-weight: bold;
                z-index: 100;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                text-align: center;
                opacity: 0;
                transition: opacity 0.5s ease-in-out;
            }
            
            .game-complete .game-complete-banner {
                opacity: 1;
            }
            
            .control-group {
                margin-bottom: 15px;
                display: flex;
                align-items: center;
            }
            
            .control-group label {
                margin-right: 10px;
                font-weight: bold;
            }
            
            .button-container {
                display: flex;
                justify-content: space-between;
                margin-top: 15px;
            }
            
            .button-container button {
                margin-right: 10px;
            }
            
            .message-area {
                margin: 10px 0;
                padding: 10px;
                border-radius: 5px;
                display: none;
            }
            
            .message-area:not(:empty) {
                display: block;
            }
            
            .message-success { 
                background-color: #d4edda; 
                color: #155724; 
            }
            
            .message-warning { 
                background-color: #fff3cd; 
                color: #856404; 
            }
            
            .message-error { 
                background-color: #f8d7da; 
                color: #721c24; 
            }
            
            .message-info { 
                background-color: #d1ecf1; 
                color: #0c5460; 
            }
            
            .move-count {
                font-size: 16px;
                font-weight: bold;
                margin: 10px 0;
            }
            
            .performance-metrics {
                margin-top: 20px;
                padding: 15px;
                background-color: #f8f9fa;
                border-radius: 8px;
                border: 1px solid #dee2e6;
            }
            
            .metrics-title {
                font-weight: bold;
                font-size: 18px;
                margin-bottom: 10px;
                color: #495057;
            }
            
            .algorithm-metrics {
                display: flex;
                justify-content: space-between;
                margin-bottom: 5px;
            }
            
            .metrics-label {
                font-weight: bold;
                color: #495057;
            }
            
            .tower-of-hanoi.disabled {
                opacity: 0.7;
                pointer-events: none;
            }
            
            .tower-of-hanoi.solving .disk {
                transition: all 0.5s;
            }
            
            .player-input-section {
                background-color: #f8f9fa;
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 20px;
                border: 1px solid #dee2e6;
            }
            
            .player-input-section h4 {
                margin-top: 0;
                color: #495057;
                margin-bottom: 15px;
            }
            
            .player-input-form {
                margin-bottom: 15px;
            }
            
            .form-group {
                margin-bottom: 15px;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 5px;
                font-weight: bold;
                color: #495057;
            }
            
            .form-group input,
            .form-group textarea {
                width: 100%;
                padding: 8px;
                border: 1px solid #ced4da;
                border-radius: 4px;
            }
            
            .form-group textarea {
                height: 80px;
            }
            
            .form-group .hint {
                font-size: 12px;
                color: #6c757d;
                margin-top: 4px;
            }
            
            .peg-label {
                font-size: 14px;
                font-weight: bold;
                margin-top: 10px;
                color: #333;
            }
            
            .game-instructions {
                background-color: rgba(255, 255, 255, 0.7);
                padding: 10px;
                border-radius: 8px;
                margin-bottom: 15px;
                font-size: 14px;
                color: #495057;
                text-align: center;
            }
            
            .game-instructions strong {
                color: #007bff;
            }
            
            @media (max-width: 768px) {
                .tower-of-hanoi {
                    height: 300px;
                }
                
                .peg {
                    height: 170px;
                }
                
                .disk-1 { width: 40px; }
                .disk-2 { width: 50px; }
                .disk-3 { width: 60px; }
                .disk-4 { width: 70px; }
                .disk-5 { width: 80px; }
                .disk-6 { width: 90px; }
                .disk-7 { width: 100px; }
                .disk-8 { width: 110px; }
                .disk-9 { width: 120px; }
                .disk-10 { width: 130px; }
            }
        `;
        
        document.head.appendChild(style);
    }

    // Add instructions for the player
    addGameInstructions() {
        const instructionsElement = document.createElement('div');
        instructionsElement.className = 'game-instructions';
        instructionsElement.innerHTML = `
            <p><strong>Drag & Drop</strong> the disks to move them. Remember: you can only place a smaller disk on top of a larger one!</p>
        `;
        
        // Insert at the beginning of the game element
        if (this.gameElement.firstChild) {
            this.gameElement.insertBefore(instructionsElement, this.gameElement.firstChild);
        } else {
            this.gameElement.appendChild(instructionsElement);
        }
    }

    // Mouse event handlers for drag and drop
    handleDiskDragStart(event, pegIndex, diskIndex) {
        if (this.isSolving || !this.game.isGameActive) return;
        
        const pegs = this.game.getGameState().pegs;
        
        // Only allow dragging the top disk
        if (diskIndex !== pegs[pegIndex].length - 1) {
            event.preventDefault();
            return;
        }
        
        // Set the dragged disk
        this.draggedDisk = {
            pegIndex,
            diskIndex,
            diskSize: pegs[pegIndex][diskIndex]
        };
        
        // Store the dragged element for positioning
        this.draggedDiskElement = event.target;
        
        // Add the dragging class
        event.target.classList.add('dragging');
        
        // Set drag image (required for HTML5 drag)
        if (event.dataTransfer) {
            // Set drag data (required for Firefox)
            event.dataTransfer.setData('text/plain', pegIndex);
            // Make the drag image partially transparent
            event.dataTransfer.effectAllowed = 'move';
            
            // Trick to keep the ghost image at the cursor position
            setTimeout(() => {
                event.target.style.visibility = 'hidden';
            }, 0);
        }
    }

    handleDiskDragEnd(event) {
        if (this.draggedDiskElement) {
            // Remove the dragging class
            this.draggedDiskElement.classList.remove('dragging');
            this.draggedDiskElement.style.visibility = 'visible';
            this.draggedDiskElement.style.transform = '';
            
            // Reset drag state
            this.draggedDisk = null;
            this.draggedDiskElement = null;
        }
        
        // Reset all peg highlights
        const pegContainers = document.querySelectorAll('.peg-container');
        pegContainers.forEach(peg => {
            peg.classList.remove('drag-over');
        });
    }

    handlePegDragOver(event, pegIndex) {
        // Prevent default to allow drop
        event.preventDefault();
        
        // Add highlighting to the peg
        event.currentTarget.classList.add('drag-over');
        
        // Change cursor to indicate drop is allowed
        event.dataTransfer.dropEffect = 'move';
    }

    handlePegDragLeave(event) {
        // Remove highlighting from the peg
        event.currentTarget.classList.remove('drag-over');
    }

    async handlePegDrop(event, pegIndex) {
        // Prevent default action
        event.preventDefault();
        
        // Remove highlighting
        event.currentTarget.classList.remove('drag-over');
        
        // If no disk is being dragged or it's the same peg, do nothing
        if (!this.draggedDisk || this.draggedDisk.pegIndex === pegIndex) {
            return;
        }
        
        // Try to make the move
        const success = await this.game.makeMove(this.draggedDisk.pegIndex, pegIndex);
        
        // Reset drag state
        this.draggedDisk = null;
        
        // Update the UI
        this.render();
        
        // Show feedback message and check for game completion
        if (!success) {
            this.setMessage('Invalid move! You cannot place a larger disk on top of a smaller one.', 'message-warning');
        } else {
            this.checkGameCompletion();
        }
    }

    // Touch event handlers for mobile devices
    handleTouchStart(event, pegIndex, diskIndex) {
        if (this.isSolving || !this.game.isGameActive) return;
        
        const pegs = this.game.getGameState().pegs;
        
        // Only allow dragging the top disk
        if (diskIndex !== pegs[pegIndex].length - 1) {
            return;
        }
        
        // Prevent default touch actions like scrolling
        event.preventDefault();
        
        // Set the dragged disk
        this.draggedDisk = {
            pegIndex,
            diskIndex,
            diskSize: pegs[pegIndex][diskIndex]
        };
        
        // Store the dragged element
        this.draggedDiskElement = event.target;
        
        // Add the dragging class
        this.draggedDiskElement.classList.add('dragging');
        
        // Store the initial touch position
        const touch = event.touches[0];
        this.initialTouchX = touch.clientX;
        this.initialTouchY = touch.clientY;
        
        // Store the initial disk position for relative movement
        const rect = this.draggedDiskElement.getBoundingClientRect();
        this.initialLeft = rect.left;
        this.initialTop = rect.top;
    }

    handleTouchMove(event) {
        if (!this.draggedDiskElement) return;
        
        // Prevent scrolling while dragging
        event.preventDefault();
        
        const touch = event.touches[0];
        const deltaX = touch.clientX - this.initialTouchX;
        const deltaY = touch.clientY - this.initialTouchY;
        
        // Update disk position
        this.draggedDiskElement.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        
        // Find the peg under the touch point
        const pegContainers = document.querySelectorAll('.peg-container');
        
        // Remove highlighting from all pegs
        pegContainers.forEach(peg => {
            peg.classList.remove('drag-over');
        });
        
        // Check if touch is over any peg
        for (let i = 0; i < pegContainers.length; i++) {
            const pegRect = pegContainers[i].getBoundingClientRect();
            
            if (touch.clientX >= pegRect.left && touch.clientX <= pegRect.right &&
                touch.clientY >= pegRect.top && touch.clientY <= pegRect.bottom) {
                // Add highlighting to this peg
                pegContainers[i].classList.add('drag-over');
                break;
            }
        }
    }

    async handleTouchEnd(event) {
        if (!this.draggedDiskElement) return;
        
        // Find the peg under the touch point
        const touch = event.changedTouches[0];
        const pegContainers = document.querySelectorAll('.peg-container');
        let targetPegIndex = -1;
        
        for (let i = 0; i < pegContainers.length; i++) {
            const pegRect = pegContainers[i].getBoundingClientRect();
            
            if (touch.clientX >= pegRect.left && touch.clientX <= pegRect.right &&
                touch.clientY >= pegRect.top && touch.clientY <= pegRect.bottom) {
                targetPegIndex = i;
                break;
            }
        }
        
        // Remove the dragging class
        this.draggedDiskElement.classList.remove('dragging');
        this.draggedDiskElement.style.transform = '';
        
        // Remove highlighting from all pegs
        pegContainers.forEach(peg => {
            peg.classList.remove('drag-over');
        });
        
        // If a valid peg was found and it's different from the source peg
        if (targetPegIndex >= 0 && targetPegIndex !== this.draggedDisk.pegIndex) {
            // Try to make the move
            const success = await this.game.makeMove(this.draggedDisk.pegIndex, targetPegIndex);
            
            // Update the UI
            this.render();
            
            // Show feedback message
            if (!success) {
                this.setMessage('Invalid move! You cannot place a larger disk on top of a smaller one.', 'message-warning');
            } else if (this.game.isGameWon()) {
                // If game is won
                if (this.playerName) {
                    this.setMessage(`Congratulations ${this.playerName}! Puzzle solved in ${this.game.moves} moves!`, 'message-success');
                } else {
                    this.setMessage('Congratulations! Puzzle solved!', 'message-success');
                }
            }
        } else {
            // Just update the UI to reset positions
            this.render();
        }
        
        // Reset drag state
        this.draggedDisk = null;
        this.draggedDiskElement = null;
    }

    // Legacy click-based disk interaction (as backup for devices without drag support)
    handleDiskClick(pegIndex, diskIndex) {
        if (this.isSolving || !this.game.isGameActive) return;
        
        const pegs = this.game.getGameState().pegs;
        
        // If no disk is selected and this disk is on top
        if (this.selectedDisk === null && diskIndex === pegs[pegIndex].length - 1) {
            this.selectedDisk = pegIndex;
            this.render();
        } 
        // If there's a selected disk, deselect it
        else if (this.selectedDisk === pegIndex) {
            this.selectedDisk = null;
            this.render();
        }
    }

    async handlePegClick(pegIndex) {
        if (this.isSolving || !this.game.isGameActive || this.selectedDisk === null || this.selectedDisk === pegIndex) {
            return;
        }
        
        const success = await this.game.makeMove(this.selectedDisk, pegIndex);
        
        if (success) {
            this.selectedDisk = null;
            this.render();
            
            // Check if game is won
            this.checkGameCompletion();
        } else {
            this.setMessage('Invalid move! You cannot place a larger disk on top of a smaller one.', 'message-warning');
        }
    }

    // Add a new method to check for game completion
    checkGameCompletion() {
        if (this.game.isGameWon()) {
            this.isGameComplete = true;
            
            // Show celebration UI
            this.towerElement.classList.add('game-complete');
            
            // Create completion banner if it doesn't exist
            if (!document.querySelector('.game-complete-banner')) {
                const banner = document.createElement('div');
                banner.className = 'game-complete-banner';
                banner.textContent = `Puzzle Solved in ${this.game.moves} Moves!`;
                this.towerElement.appendChild(banner);
            }
            
            // Add success message
            if (this.playerName) {
                this.setMessage(`Congratulations ${this.playerName}! You've solved the Tower of Hanoi in ${this.game.moves} moves! The optimal solution requires ${this.game.minMoves} moves.`, 'message-success');
            } else {
                this.setMessage(`Congratulations! You've solved the Tower of Hanoi in ${this.game.moves} moves! The optimal solution requires ${this.game.minMoves} moves.`, 'message-success');
            }
            
            // Disable the tower to prevent further moves
            this.disableTower();
        }
    }

    async handleSolveClick() {
        if (this.isSolving) return;
        
        this.isSolving = true;
        this.towerElement.classList.add('solving');
        this.solveButtonElement.disabled = true;
        this.resetButtonElement.disabled = true; // Also disable reset while solving
        this.statusElement.textContent = 'Finding solution...';
        
        try {
            // Reset the game first
            this.game.reset();
            this.isGameComplete = false; // Reset completion status
            this.towerElement.classList.remove('game-complete'); // Remove celebration styles
            
            // Remove any existing completion banner
            const banner = document.querySelector('.game-complete-banner');
            if (banner) banner.remove();
            
            this.render();
            
            // Get solution from selected algorithm
            const solution = await this.game.getSolution();
            
            // Display solution metrics
            this.showPerformanceMetrics(
                this.game.selectedAlgorithm, 
                solution.moveCount,
                solution.executionTime
            );
            
            // Animate the solution
            await this.animateSolution(solution.moves);
            
            // Check if solution is complete
            if (this.game.isGameWon()) {
                this.isGameComplete = true;
                this.towerElement.classList.add('game-complete');
                
                // Create completion banner
                const banner = document.createElement('div');
                banner.className = 'game-complete-banner';
                banner.textContent = `Solution Complete: ${solution.moveCount} Moves!`;
                this.towerElement.appendChild(banner);
                
                this.setMessage(`Solution completed with ${solution.moveCount} moves!`, 'message-success');
            } else {
                this.setMessage('Solution did not complete correctly. Please try again.', 'message-error');
            }
        } catch (error) {
            console.error('Error solving Tower of Hanoi:', error);
            this.setMessage('Error solving puzzle: ' + error.message, 'message-error');
        } finally {
            this.isSolving = false;
            this.towerElement.classList.remove('solving');
            this.solveButtonElement.disabled = false;
            this.resetButtonElement.disabled = false;
        }
    }

    async animateSolution(moves) {
        const MOVE_DELAY = 500; // ms
        
        for (let i = 0; i < moves.length; i++) {
            const move = moves[i];
            
            // Wait before making move
            await new Promise(resolve => setTimeout(resolve, MOVE_DELAY));
            
            // Make the move
            const success = await this.game.makeMove(move.from, move.to);
            
            // Update UI
            this.render();
            
            // If move failed, show error and stop animation
            if (!success) {
                this.setMessage(`Error in move ${i+1}: Cannot move disk from peg ${move.from} to peg ${move.to}`, 'message-error');
                return;
            }
            
            // Update status with progress
            this.statusElement.textContent = `Solving: Move ${i+1}/${moves.length}`;
        }
        
        // Update final status
        this.statusElement.textContent = `Solution complete: ${moves.length} moves`;
    }

    showPerformanceMetrics(algorithm, moveCount, time) {
        this.metricsElement.style.display = 'block';
        
        // Ensure time is properly formatted
        const formattedTime = time < 0.001 ? 
            `${(time * 1000).toFixed(3)} ms` : 
            `${time.toFixed(3)} seconds`;
            
        let algorithmName;
        switch (algorithm) {
            case 'recursive': algorithmName = 'Recursive'; break;
            case 'iterative': algorithmName = 'Iterative'; break;
            case 'frameStewart': algorithmName = 'Frame-Stewart (4-peg)'; break;
            default: algorithmName = algorithm;
        }
            
        this.metricsElement.innerHTML = `
            <div class="metrics-title">Algorithm Performance</div>
            <div class="algorithm-metrics">
                <span class="metrics-label">Algorithm:</span>
                <span>${algorithmName}</span>
            </div>
            <div class="algorithm-metrics">
                <span class="metrics-label">Total Moves:</span>
                <span>${moveCount}</span>
            </div>
            <div class="algorithm-metrics">
                <span class="metrics-label">Execution Time:</span>
                <span>${formattedTime}</span>
            </div>
            <div class="algorithm-metrics">
                <span class="metrics-label">Optimal Moves:</span>
                <span>${this.game.minMoves}</span>
            </div>
        `;
    }

    handleResetClick() {
        if (this.isSolving) return;
        
        this.game.reset();
        this.selectedDisk = null;
        this.isGameComplete = false;
        
        // Remove celebration effects
        this.towerElement.classList.remove('game-complete');
        
        // Remove any completion banner
        const banner = document.querySelector('.game-complete-banner');
        if (banner) banner.remove();
        
        this.enableTower();
        this.clearMessage();
        this.metricsElement.style.display = 'none';
        this.render();
        
        this.setMessage('Puzzle reset.', 'message-info');
    }
    
    handleAlgorithmChange(event) {
        try {
            this.game.setAlgorithm(event.target.value);
        } catch (error) {
            this.setMessage(error.message, 'message-error');
            
            // Reset selection to match game's algorithm
            event.target.value = this.game.selectedAlgorithm;
        }
    }
    
    handleDiskCountChange(event) {
        if (this.isSolving) return;
        
        try {
            const diskCount = parseInt(event.target.value);
            this.game.setDiskCount(diskCount);
            this.selectedDisk = null;
            this.render();
            this.clearMessage();
        } catch (error) {
            this.setMessage(error.message, 'message-error');
        }
    }
    
    handlePegCountChange(event) {
        if (this.isSolving) return;
        
        try {
            const pegCount = parseInt(event.target.value);
            this.game.setPegCount(pegCount);
            this.selectedDisk = null;
            this.render();
            this.clearMessage();
            
            // Update algorithm options based on peg count
            this.updateAlgorithmOptions();
        } catch (error) {
            this.setMessage(error.message, 'message-error');
            
            // Reset selection to match game's peg count
            event.target.value = this.game.pegCount;
        }
    }
    
    updateAlgorithmOptions() {
        // Remove all options
        while (this.algorithmSelectElement.firstChild) {
            this.algorithmSelectElement.removeChild(this.algorithmSelectElement.firstChild);
        }
        
        // Add standard algorithms
        const algorithms = [
            { value: 'recursive', text: 'Recursive Algorithm' },
            { value: 'iterative', text: 'Iterative Algorithm' }
        ];
        
        // Add Frame-Stewart only for 4 pegs
        if (this.game.pegCount === 4) {
            algorithms.push({ value: 'frameStewart', text: 'Frame-Stewart Algorithm' });
        }
        
        algorithms.forEach(algo => {
            const option = document.createElement('option');
            option.value = algo.value;
            option.textContent = algo.text;
            if (algo.value === this.game.selectedAlgorithm) option.selected = true;
            this.algorithmSelectElement.appendChild(option);
        });
    }
    
    setMessage(message, className = 'message-info') {
        this.messageElement.textContent = message;
        this.messageElement.className = `message-area ${className}`;
    }
    
    clearMessage() {
        this.messageElement.textContent = '';
        this.messageElement.className = 'message-area';
    }
    
    disableTower() {
        this.towerElement.classList.add('disabled');
    }
    
    enableTower() {
        this.towerElement.classList.remove('disabled');
    }

    render() {
        // Clear tower container
        this.towerElement.innerHTML = '';
        
        const gameState = this.game.getGameState();
        
        // Create pegs
        for (let pegIndex = 0; pegIndex < gameState.pegCount; pegIndex++) {
            const pegContainer = document.createElement('div');
            pegContainer.className = 'peg-container';
            
            if (this.selectedDisk === pegIndex) {
                pegContainer.classList.add('selected');
            }
            
            // Setup drag event handlers on the peg
            pegContainer.addEventListener('dragover', (event) => this.handlePegDragOver(event, pegIndex));
            pegContainer.addEventListener('dragleave', (event) => this.handlePegDragLeave(event));
            pegContainer.addEventListener('drop', (event) => this.handlePegDrop(event, pegIndex));
            
            // Create peg
            const peg = document.createElement('div');
            peg.className = 'peg';
            pegContainer.appendChild(peg);
            
            // Create base
            const base = document.createElement('div');
            base.className = 'base';
            pegContainer.appendChild(base);
            
            // Add peg label (A, B, C, D)
            const pegLabel = document.createElement('div');
            pegLabel.className = 'peg-label';
            pegLabel.textContent = String.fromCharCode(65 + pegIndex); // A, B, C, D
            pegContainer.appendChild(pegLabel);
            
            // Create disks - start from the bottom disk (larger ones first)
            const disks = gameState.pegs[pegIndex];
            const offsetHeight = 22; // Height of each disk plus margin
            
            for (let diskIndex = 0; diskIndex < disks.length; diskIndex++) {
                const disk = document.createElement('div');
                const diskSize = disks[diskIndex];
                disk.className = `disk disk-${diskSize}`;
                disk.setAttribute('draggable', 'true');
                disk.style.setProperty('--disk-index', diskIndex); // For animation timing
                
                // Add selected class if this is the selected disk
                if (this.selectedDisk === pegIndex && diskIndex === disks.length - 1) {
                    disk.classList.add('selected');
                }
                
                // Position disk on the peg - calculate from the bottom up
                // We position disks starting from bottom (base) and going up
                // This ensures larger disks are at the bottom
                disk.style.bottom = `${(diskIndex * offsetHeight) + 40}px`; // 40px offset for the base
                
                // Set disk number on the disk for visibility
                disk.textContent = diskSize;
                
                // Set disk width based on size (already set in CSS)
                
                // Add content for screen readers and debugging
                disk.dataset.size = diskSize.toString();
                
                // Add various event listeners
                
                // For mouse drag and drop
                disk.addEventListener('dragstart', (event) => this.handleDiskDragStart(event, pegIndex, diskIndex));
                disk.addEventListener('dragend', (event) => this.handleDiskDragEnd(event));
                
                // For touch devices
                disk.addEventListener('touchstart', (event) => this.handleTouchStart(event, pegIndex, diskIndex), { passive: false });
                disk.addEventListener('touchmove', this.handleTouchMove, { passive: false });
                disk.addEventListener('touchend', this.handleTouchEnd);
                
                // Fallback click for devices without drag support
                disk.addEventListener('click', () => this.handleDiskClick(pegIndex, diskIndex));
                
                pegContainer.appendChild(disk);
            }
            
            // Add peg click handler for moving disks (as fallback)
            pegContainer.addEventListener('click', () => this.handlePegClick(pegIndex));
            
            // Add peg to the tower
            this.towerElement.appendChild(pegContainer);
        }
        
        // If the game is complete, add the celebration banner back
        if (this.isGameComplete || gameState.isGameComplete) {
            this.towerElement.classList.add('game-complete');
            
            // Add banner if it doesn't exist
            if (!document.querySelector('.game-complete-banner')) {
                const banner = document.createElement('div');
                banner.className = 'game-complete-banner';
                banner.textContent = `Puzzle Solved in ${gameState.moveCount} Moves!`;
                this.towerElement.appendChild(banner);
            }
        }
        
        // Update move counter
        if (this.moveCountElement) {
            this.moveCountElement.textContent = gameState.moveCount;
        }
        
        // Update status message
        if (this.statusElement) {
            if (!gameState.isGameActive) {
                if (gameState.isGameComplete) {
                    this.statusElement.textContent = "Puzzle Solved!";
                }
            } else {
                this.statusElement.textContent = `Moves: ${gameState.moveCount} / Optimal: ${gameState.optimalMoveCount}`;
            }
        }
    }

    createGameControls(containerElement) {
        // Disk count selector
        const diskCountLabel = document.createElement('label');
        diskCountLabel.textContent = 'Disk Count: ';
        
        this.diskCountSelectElement = document.createElement('select');
        
        // Add disk count options (1-10)
        for (let count = 1; count <= 10; count++) {
            const option = document.createElement('option');
            option.value = count;
            option.textContent = count;
            if (count === this.game.diskCount) option.selected = true;
            this.diskCountSelectElement.appendChild(option);
        }
        
        this.diskCountSelectElement.addEventListener('change', this.handleDiskCountChange);
        
        const diskControlGroup = document.createElement('div');
        diskControlGroup.className = 'control-group';
        diskControlGroup.appendChild(diskCountLabel);
        diskControlGroup.appendChild(this.diskCountSelectElement);
        containerElement.appendChild(diskControlGroup);
        
        // Peg count selector
        const pegCountLabel = document.createElement('label');
        pegCountLabel.textContent = 'Peg Count: ';
        
        this.pegCountSelectElement = document.createElement('select');
        
        // Add peg count options (3 or 4)
        const pegCounts = [3, 4];
        pegCounts.forEach(count => {
            const option = document.createElement('option');
            option.value = count;
            option.textContent = count;
            if (count === this.game.pegCount) option.selected = true;
            this.pegCountSelectElement.appendChild(option);
        });
        
        this.pegCountSelectElement.addEventListener('change', this.handlePegCountChange);
        
        const pegControlGroup = document.createElement('div');
        pegControlGroup.className = 'control-group';
        pegControlGroup.appendChild(pegCountLabel);
        pegControlGroup.appendChild(this.pegCountSelectElement);
        containerElement.appendChild(pegControlGroup);
        
        // Algorithm selector
        const algorithmLabel = document.createElement('label');
        algorithmLabel.textContent = 'Algorithm: ';
        
        this.algorithmSelectElement = document.createElement('select');
        
        // Add algorithm options - this will be populated in updateAlgorithmOptions
        this.algorithmSelectElement.addEventListener('change', this.handleAlgorithmChange);
        
        const algoControlGroup = document.createElement('div');
        algoControlGroup.className = 'control-group';
        algoControlGroup.appendChild(algorithmLabel);
        algoControlGroup.appendChild(this.algorithmSelectElement);
        containerElement.appendChild(algoControlGroup);
        
        // Initialize algorithm options
        this.updateAlgorithmOptions();
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
TowerOfHanoiUI.init = async function() {
    try {
        const TowerOfHanoi = (await import('../game.js')).default;
        const gameInstance = new TowerOfHanoi();
        const uiInstance = new TowerOfHanoiUI();
        await uiInstance.initialize(gameInstance);
        return uiInstance;
    } catch (error) {
        console.error('Failed to initialize Tower of Hanoi:', error);
        throw error;
    }
};

// Export the class as default to match app.js import expectations
export default TowerOfHanoiUI;
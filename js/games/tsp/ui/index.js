/**
 * Traveling Salesman Problem UI
 * User interface for the TSP game
 */

import TSPGame from '../game.js';
import logger from '../../../utils/logger.js';

/**
 * TSP UI class
 * Handles the user interface for the Traveling Salesman Problem
 */
export default class TSPUI {
  /**
   * Constructor
   * @param {Object} options - UI options
   */
  constructor(options = {}) {
    this.options = {
      canvasId: 'tsp-canvas',
      controlsId: 'tsp-controls',
      statusId: 'tsp-status',
      infoId: 'tsp-info',
      ...options
    };
    
    this.game = null;
    this.canvas = null;
    this.ctx = null;
    this.cityPositions = {};
    this.draggingCity = null;
    this.hoveredCity = null;
    
    // Animation
    this.isAnimating = false;
    this.animationPath = [];
    this.animationFrame = 0;
    this.animationSpeed = 10; // ms per frame
    
    // Dimensions
    this.width = 0;
    this.height = 0;
    this.cityRadius = 20;
    this.cityColors = {
      normal: '#4a90e2',
      home: '#ff9500',
      selected: '#50c878',
      hovered: '#ff6b6b',
      path: '#8a2be2'
    };
    
    // Path colors for different algorithms
    this.pathColors = {
      'user': '#ff6b6b',
      'recursion': '#4a90e2',
      'topdown': '#50c878',
      'nearest': '#ffbb00'
    };
  }
  
  /**
   * Initialize the UI
   */
  async initialize() {
    try {
      // Initialize game
      this.game = new TSPGame();
      await this.game.initialize();
      
      // Setup UI components
      this._setupCanvas();
      this._setupEventListeners();
      this._createControls();
      this._createStatusPanel();
      
      // Generate city positions
      this._generateCityPositions();
      
      // Initial render
      this.render();
      
      logger.info('TSP UI initialized');
      return true;
    } catch (error) {
      logger.error('Error initializing TSP UI:', error);
      this._showError(`Failed to initialize game: ${error.message}`);
      return false;
    }
  }
  
  /**
   * Set up the canvas
   */
  _setupCanvas() {
    this.canvas = document.getElementById(this.options.canvasId);
    if (!this.canvas) {
      throw new Error(`Canvas element with ID "${this.options.canvasId}" not found`);
    }
    
    this.ctx = this.canvas.getContext('2d');
    this._resizeCanvas();
    
    // Handle window resize
    window.addEventListener('resize', () => {
      this._resizeCanvas();
      this._generateCityPositions();
      this.render();
    });
  }
  
  /**
   * Set up event listeners
   */
  _setupEventListeners() {
    // Mouse move for hovering
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Check if hovering over a city
      let hoveredCity = null;
      for (const city in this.cityPositions) {
        const pos = this.cityPositions[city];
        const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
        
        if (distance <= this.cityRadius) {
          hoveredCity = city;
          break;
        }
      }
      
      if (hoveredCity !== this.hoveredCity) {
        this.hoveredCity = hoveredCity;
        this.render();
      }
    });
    
    // Click to select a city
    this.canvas.addEventListener('click', (e) => {
      if (this.isAnimating) return;
      
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Check if clicked on a city
      for (const city in this.cityPositions) {
        const pos = this.cityPositions[city];
        const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
        
        if (distance <= this.cityRadius) {
          this._selectCity(city);
          break;
        }
      }
    });
    
    // Mouse leave
    this.canvas.addEventListener('mouseleave', () => {
      this.hoveredCity = null;
      this.render();
    });
  }
  
  /**
   * Resize the canvas to fit its container
   */
  _resizeCanvas() {
    const container = this.canvas.parentElement;
    this.canvas.width = container.clientWidth;
    this.canvas.height = container.clientWidth * 0.75; // 4:3 aspect ratio
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.cityRadius = Math.min(this.width, this.height) / 25;
  }
  
  /**
   * Generate random positions for cities
   */
  _generateCityPositions() {
    const cities = this.game.cities;
    const padding = this.cityRadius * 2;
    
    // Clear existing positions
    this.cityPositions = {};
    
    // Determine grid dimensions based on number of cities
    const numCities = cities.length;
    let cols = Math.ceil(Math.sqrt(numCities));
    let rows = Math.ceil(numCities / cols);
    
    // Calculate cell size
    const cellWidth = (this.width - padding * 2) / cols;
    const cellHeight = (this.height - padding * 2) / rows;
    
    // Generate positions in a grid layout with some randomness
    let index = 0;
    for (let row = 0; row < rows && index < numCities; row++) {
      for (let col = 0; col < cols && index < numCities; col++) {
        const city = cities[index];
        
        // Add randomness within the cell
        const jitter = 0.3; // Amount of randomness (0-0.5)
        const randomX = (Math.random() * jitter * 2 - jitter) * cellWidth;
        const randomY = (Math.random() * jitter * 2 - jitter) * cellHeight;
        
        // Calculate position
        const x = padding + col * cellWidth + cellWidth / 2 + randomX;
        const y = padding + row * cellHeight + cellHeight / 2 + randomY;
        
        this.cityPositions[city] = { x, y };
        index++;
      }
    }
  }
  
  /**
   * Create the controls panel
   */
  _createControls() {
    const container = document.getElementById(this.options.controlsId);
    if (!container) return;
    
    container.innerHTML = `
      <div class="mb-3">
        <label class="form-label">Player Name</label>
        <input type="text" class="form-control" id="tsp-player-name" value="Player">
      </div>
      
      <div class="mb-3">
        <label class="form-label">Home City: <span id="tsp-home-city" class="badge bg-warning">${this.game.homeCity}</span></label>
      </div>
      
      <div class="mb-3">
        <label class="form-label">Your Path</label>
        <div class="d-flex">
          <input type="text" class="form-control" id="tsp-path" value="${this.game.userPath.join(' → ')}" readonly>
          <button class="btn btn-outline-danger ms-2" id="tsp-remove-last">
            <i class="fas fa-undo"></i>
          </button>
        </div>
        <small class="text-muted">Click on cities to build your path</small>
      </div>
      
      <div class="mb-3">
        <label class="form-label">Distance: <span id="tsp-distance">0</span> km</label>
      </div>
      
      <div class="d-flex flex-wrap gap-2">
        <button class="btn btn-primary" id="tsp-validate">
          <i class="fas fa-check-circle me-1"></i> Validate Solution
        </button>
        <button class="btn btn-success" id="tsp-reset-path">
          <i class="fas fa-redo me-1"></i> Reset Path
        </button>
        <button class="btn btn-warning" id="tsp-new-game">
          <i class="fas fa-dice me-1"></i> New Game
        </button>
      </div>
      
      <hr>
      
      <div class="my-3">
        <h6 class="mb-2">Solve with Algorithm</h6>
        <div class="algorithm-buttons d-flex flex-wrap gap-2">
          <button class="btn btn-outline-primary" id="tsp-nearest">
            <i class="fas fa-route me-1"></i> Nearest Neighbor
          </button>
          <button class="btn btn-outline-success" id="tsp-dynamic">
            <i class="fas fa-table me-1"></i> Dynamic Programming
          </button>
          <button class="btn btn-outline-danger" id="tsp-recursion">
            <i class="fas fa-project-diagram me-1"></i> Recursive
          </button>
        </div>
      </div>
      
      <div class="form-check form-switch my-3">
        <input class="form-check-input" type="checkbox" id="tsp-show-distances">
        <label class="form-check-label" for="tsp-show-distances">Show Distances</label>
      </div>
    `;
    
    // Add event listeners
    document.getElementById('tsp-remove-last').addEventListener('click', () => this._removeLastCity());
    document.getElementById('tsp-validate').addEventListener('click', () => this._validateSolution());
    document.getElementById('tsp-reset-path').addEventListener('click', () => this._resetPath());
    document.getElementById('tsp-new-game').addEventListener('click', () => this._resetGame());
    document.getElementById('tsp-nearest').addEventListener('click', () => this._solveWith('nearest'));
    document.getElementById('tsp-dynamic').addEventListener('click', () => this._solveWith('topdown'));
    document.getElementById('tsp-recursion').addEventListener('click', () => this._solveWith('recursion'));
    document.getElementById('tsp-show-distances').addEventListener('change', (e) => {
      this.showDistances = e.target.checked;
      this.render();
    });
    
    // Update player name when changed
    document.getElementById('tsp-player-name').addEventListener('change', (e) => {
      this.game.options.playerName = e.target.value;
    });
  }
  
  /**
   * Create the status panel
   */
  _createStatusPanel() {
    const container = document.getElementById(this.options.statusId);
    if (!container) return;
    
    container.innerHTML = `
      <div class="alert alert-info" id="tsp-message">
        <i class="fas fa-info-circle me-2"></i>
        Start by clicking on the home city and then visit each city once before returning home.
      </div>
      
      <div class="performance-metrics d-none" id="tsp-performance">
        <h6 class="metrics-title">Algorithm Performance</h6>
        <div id="tsp-algorithms-comparison"></div>
      </div>
      
      <div class="complexity-info mt-3">
        <h6>Algorithm Complexity</h6>
        <ul class="list-group">
          <li class="list-group-item d-flex justify-content-between align-items-center">
            Nearest Neighbor
            <span class="badge bg-success rounded-pill">O(n²)</span>
          </li>
          <li class="list-group-item d-flex justify-content-between align-items-center">
            Dynamic Programming
            <span class="badge bg-warning rounded-pill">O(n²·2ⁿ)</span>
          </li>
          <li class="list-group-item d-flex justify-content-between align-items-center">
            Recursive (Brute Force)
            <span class="badge bg-danger rounded-pill">O(n!)</span>
          </li>
        </ul>
      </div>
    `;
  }
  
  /**
   * Select a city to add to the path
   * @param {string} city - The city to add
   */
  _selectCity(city) {
    try {
      this.game.addToPath(city);
      this._updatePathDisplay();
      this.render();
    } catch (error) {
      this._showMessage(error.message, 'warning');
    }
  }
  
  /**
   * Remove the last city from the path
   */
  _removeLastCity() {
    try {
      this.game.removeLastCity();
      this._updatePathDisplay();
      this.render();
    } catch (error) {
      this._showMessage(error.message, 'warning');
    }
  }
  
  /**
   * Reset the path to just the home city
   */
  _resetPath() {
    this.game.resetPath();
    this._updatePathDisplay();
    this.render();
    this._showMessage('Path reset to home city', 'info');
  }
  
  /**
   * Validate the user's solution
   */
  _validateSolution() {
    const result = this.game.validateUserSolution();
    
    if (result.valid) {
      this._showMessage(`Valid solution! Total distance: ${result.distance} km`, 'success');
      this.game.endGame('completed');
    } else {
      this._showMessage(result.message, 'warning');
    }
  }
  
  /**
   * Reset the game with new random distances and home city
   */
  async _resetGame() {
    try {
      const gameState = await this.game.resetGame();
      this._generateCityPositions();
      this._updatePathDisplay();
      this._updateHomeCity();
      this.render();
      this._showMessage('New game started with random distances and home city', 'info');
      
      // Reset algorithm results display
      document.getElementById('tsp-performance').classList.add('d-none');
      document.getElementById('tsp-algorithms-comparison').innerHTML = '';
    } catch (error) {
      this._showError(`Failed to reset game: ${error.message}`);
    }
  }
  
  /**
   * Solve the TSP using the specified algorithm
   * @param {string} algorithm - Algorithm name
   */
  async _solveWith(algorithm) {
    try {
      // Show loading state
      const button = document.getElementById(`tsp-${algorithm === 'topdown' ? 'dynamic' : algorithm}`);
      const originalText = button.innerHTML;
      button.disabled = true;
      button.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Solving...';
      
      // Allow UI to update
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Run the algorithm
      const result = await this.game.solve(algorithm);
      
      // Restore button state
      button.disabled = false;
      button.innerHTML = originalText;
      
      if (result.success) {
        this._showMessage(
          `${this._getAlgorithmName(algorithm)} found a path with distance ${result.distance} km in ${result.executionTime.toFixed(2)} ms`,
          'success'
        );
        
        // Animate the solution
        this._animatePath(result.path, algorithm);
        
        // Update performance display
        this._updateAlgorithmsComparison();
      } else {
        this._showMessage(`Failed to solve with ${algorithm}: ${result.error || 'Unknown error'}`, 'danger');
      }
    } catch (error) {
      this._showError(`Error running ${algorithm}: ${error.message}`);
    }
  }
  
  /**
   * Get a readable name for an algorithm
   * @param {string} algorithm - Algorithm key
   * @returns {string} Readable name
   */
  _getAlgorithmName(algorithm) {
    switch(algorithm) {
      case 'nearest': return 'Nearest Neighbor';
      case 'topdown': return 'Dynamic Programming';
      case 'recursion': return 'Recursive Brute Force';
      default: return algorithm;
    }
  }
  
  /**
   * Animate a path solution
   * @param {Array} path - Array of city names
   * @param {string} algorithm - Algorithm used
   */
  _animatePath(path, algorithm) {
    // Stop any existing animation
    if (this.isAnimating) {
      cancelAnimationFrame(this.animationRequestId);
    }
    
    this.isAnimating = true;
    this.animationPath = path;
    this.animationAlgorithm = algorithm;
    this.animationFrame = 0;
    
    const animate = () => {
      this.animationFrame++;
      this.render();
      
      const pathProgress = Math.min(1, this.animationFrame / (path.length * 5));
      
      if (pathProgress < 1) {
        this.animationRequestId = requestAnimationFrame(animate);
      } else {
        this.isAnimating = false;
      }
    };
    
    this.animationRequestId = requestAnimationFrame(animate);
  }
  
  /**
   * Update the algorithms comparison display
   */
  _updateAlgorithmsComparison() {
    const container = document.getElementById('tsp-algorithms-comparison');
    if (!container) return;
    
    const comparison = this.game.compareAlgorithms();
    if (!comparison.comparison || comparison.comparison.length === 0) return;
    
    // Show the container
    document.getElementById('tsp-performance').classList.remove('d-none');
    
    // Generate HTML
    const html = `
      <div class="table-responsive">
        <table class="table table-sm">
          <thead>
            <tr>
              <th>Algorithm</th>
              <th>Distance (km)</th>
              <th>Time (ms)</th>
            </tr>
          </thead>
          <tbody>
            ${comparison.comparison.map(algo => `
              <tr class="${algo.name === comparison.bestAlgorithm ? 'table-success' : ''}">
                <td>${this._getAlgorithmName(algo.name)}</td>
                <td>${algo.distance}</td>
                <td>${algo.executionTime.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <div class="mt-2">
        <strong>Best Algorithm:</strong> ${this._getAlgorithmName(comparison.bestAlgorithm)} 
        (${comparison.shortestDistance} km)
      </div>
    `;
    
    container.innerHTML = html;
  }
  
  /**
   * Update the path display
   */
  _updatePathDisplay() {
    const pathElement = document.getElementById('tsp-path');
    if (pathElement) {
      pathElement.value = this.game.userPath.join(' → ');
    }
    
    const distanceElement = document.getElementById('tsp-distance');
    if (distanceElement) {
      const distance = this.game.calculateDistance(this.game.userPath);
      distanceElement.textContent = distance;
    }
  }
  
  /**
   * Update the home city display
   */
  _updateHomeCity() {
    const element = document.getElementById('tsp-home-city');
    if (element) {
      element.textContent = this.game.homeCity;
    }
  }
  
  /**
   * Show a message to the user
   * @param {string} message - The message to show
   * @param {string} type - Message type (info, success, warning, danger)
   */
  _showMessage(message, type = 'info') {
    const element = document.getElementById('tsp-message');
    if (!element) return;
    
    element.className = `alert alert-${type}`;
    
    // Add appropriate icon
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'warning') icon = 'exclamation-triangle';
    if (type === 'danger') icon = 'exclamation-circle';
    
    element.innerHTML = `<i class="fas fa-${icon} me-2"></i>${message}`;
  }
  
  /**
   * Show an error message
   * @param {string} message - Error message
   */
  _showError(message) {
    logger.error(message);
    this._showMessage(message, 'danger');
  }
  
  /**
   * Render the game state
   */
  render() {
    if (!this.ctx || !this.game) return;
    
    // Clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // Get game state
    const state = this.game.getGameState();
    
    // Draw distances first (if enabled)
    if (this.showDistances) {
      this._drawDistances(state);
    }
    
    // Draw algorithm paths (if any)
    this._drawAlgorithmPaths(state);
    
    // Draw user's path
    this._drawPath(state.userPath, 'user');
    
    // Draw all cities
    this._drawCities(state);
    
    // Draw city labels
    this._drawCityLabels(state);
    
    // Draw info panel
    this._updateInfoPanel();
  }
  
  /**
   * Draw the distances between cities
   * @param {Object} state - Game state
   */
  _drawDistances(state) {
    const { distances, cities } = state;
    
    this.ctx.globalAlpha = 0.4;
    this.ctx.fillStyle = '#333';
    this.ctx.font = '10px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    for (let i = 0; i < cities.length; i++) {
      for (let j = i + 1; j < cities.length; j++) {
        const distance = distances[i][j];
        const city1 = cities[i];
        const city2 = cities[j];
        const pos1 = this.cityPositions[city1];
        const pos2 = this.cityPositions[city2];
        
        if (!pos1 || !pos2) continue;
        
        // Draw a thin line between cities
        this.ctx.beginPath();
        this.ctx.moveTo(pos1.x, pos1.y);
        this.ctx.lineTo(pos2.x, pos2.y);
        this.ctx.strokeStyle = '#ccc';
        this.ctx.lineWidth = 0.5;
        this.ctx.stroke();
        
        // Draw distance label at the middle of the line
        const midX = (pos1.x + pos2.x) / 2;
        const midY = (pos1.y + pos2.y) / 2;
        
        // Background for distance text
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        this.ctx.beginPath();
        this.ctx.rect(midX - 15, midY - 7, 30, 14);
        this.ctx.fill();
        
        // Distance text
        this.ctx.fillStyle = '#333';
        this.ctx.fillText(`${distance}`, midX, midY);
      }
    }
    
    this.ctx.globalAlpha = 1;
  }
  
  /**
   * Draw the algorithm paths
   * @param {Object} state - Game state
   */
  _drawAlgorithmPaths(state) {
    const { algorithmResults } = state;
    
    for (const algorithm in algorithmResults) {
      const result = algorithmResults[algorithm];
      if (result && result.path && result.path.length > 0) {
        // Draw the path
        this._drawPath(result.path, algorithm, this.isAnimating && this.animationAlgorithm === algorithm);
      }
    }
  }
  
  /**
   * Draw a path between cities
   * @param {Array<string>} path - Array of city names
   * @param {string} type - Path type (user, nearest, recursion, topdown)
   * @param {boolean} animate - Whether to animate the path
   */
  _drawPath(path, type, animate = false) {
    if (!path || path.length < 2) return;
    
    const color = this.pathColors[type] || '#333';
    
    // Get number of segments to draw
    let segments = path.length - 1;
    if (animate) {
      segments = Math.floor(this.animationFrame / 5);
      segments = Math.min(segments, path.length - 1);
    }
    
    this.ctx.beginPath();
    
    for (let i = 0; i <= segments; i++) {
      const city = path[i];
      const pos = this.cityPositions[city];
      
      if (!pos) continue;
      
      if (i === 0) {
        this.ctx.moveTo(pos.x, pos.y);
      } else {
        this.ctx.lineTo(pos.x, pos.y);
      }
    }
    
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = type === 'user' ? 4 : 2;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    
    if (type !== 'user') {
      // Dashed line for algorithm paths
      this.ctx.setLineDash([5, 3]);
    } else {
      this.ctx.setLineDash([]);
    }
    
    this.ctx.stroke();
    this.ctx.setLineDash([]);
    
    // Draw direction arrows
    for (let i = 0; i < segments; i++) {
      const city1 = path[i];
      const city2 = path[i + 1];
      const pos1 = this.cityPositions[city1];
      const pos2 = this.cityPositions[city2];
      
      if (!pos1 || !pos2) continue;
      
      // Only draw arrows for user path or when not animating
      if (type === 'user' || !animate) {
        this._drawArrow(pos1.x, pos1.y, pos2.x, pos2.y, color);
      }
    }
  }
  
  /**
   * Draw an arrow between two points
   * @param {number} fromX - Start X
   * @param {number} fromY - Start Y
   * @param {number} toX - End X
   * @param {number} toY - End Y
   * @param {string} color - Arrow color
   */
  _drawArrow(fromX, fromY, toX, toY, color) {
    const headLength = 10;
    const angle = Math.atan2(toY - fromY, toX - fromX);
    
    // Calculate a point slightly before the destination for the arrow head
    const offsetX = Math.cos(angle) * this.cityRadius;
    const offsetY = Math.sin(angle) * this.cityRadius;
    const arrowX = toX - offsetX;
    const arrowY = toY - offsetY;
    
    // Draw the arrow head
    this.ctx.beginPath();
    this.ctx.moveTo(arrowX, arrowY);
    this.ctx.lineTo(
      arrowX - headLength * Math.cos(angle - Math.PI / 6),
      arrowY - headLength * Math.sin(angle - Math.PI / 6)
    );
    this.ctx.moveTo(arrowX, arrowY);
    this.ctx.lineTo(
      arrowX - headLength * Math.cos(angle + Math.PI / 6),
      arrowY - headLength * Math.sin(angle + Math.PI / 6)
    );
    
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  }
  
  /**
   * Draw all cities
   * @param {Object} state - Game state
   */
  _drawCities(state) {
    const { cities, homeCity, userPath } = state;
    
    cities.forEach(city => {
      const pos = this.cityPositions[city];
      if (!pos) return;
      
      // Determine the city's state
      const isHome = city === homeCity;
      const isInPath = userPath.includes(city);
      const isHovered = city === this.hoveredCity;
      
      // Choose color based on state
      let color = this.cityColors.normal;
      if (isHome) color = this.cityColors.home;
      if (isInPath && !isHome) color = this.cityColors.path;
      if (isHovered) color = this.cityColors.hovered;
      
      // Draw city circle
      this.ctx.beginPath();
      this.ctx.arc(pos.x, pos.y, this.cityRadius, 0, 2 * Math.PI);
      this.ctx.fillStyle = color;
      this.ctx.fill();
      
      // Draw border
      this.ctx.lineWidth = 2;
      this.ctx.strokeStyle = '#fff';
      this.ctx.stroke();
    });
  }
  
  /**
   * Draw city labels
   * @param {Object} state - Game state
   */
  _drawCityLabels(state) {
    const { cities, homeCity } = state;
    
    this.ctx.fillStyle = '#fff';
    this.ctx.font = `${this.cityRadius * 0.8}px Arial`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    cities.forEach(city => {
      const pos = this.cityPositions[city];
      if (!pos) return;
      
      // Draw city name
      this.ctx.fillText(city, pos.x, pos.y);
      
      // Add home indicator
      if (city === homeCity) {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        this.ctx.font = `${this.cityRadius * 0.4}px Arial`;
        this.ctx.fillText('HOME', pos.x, pos.y + this.cityRadius * 0.6);
        this.ctx.fillStyle = '#fff';
        this.ctx.font = `${this.cityRadius * 0.8}px Arial`;
      }
    });
  }
  
  /**
   * Update the info panel
   */
  _updateInfoPanel() {
    const infoPanel = document.getElementById(this.options.infoId);
    if (!infoPanel) return;
    
    const state = this.game.getGameState();
    
    infoPanel.innerHTML = `
      <div class="canvas-overlay-info">
        <div><strong>Cities:</strong> ${state.cities.length}</div>
        <div><strong>Home:</strong> ${state.homeCity}</div>
        <div><strong>Current Distance:</strong> ${state.userDistance} km</div>
      </div>
    `;
  }
  
  /**
   * Show a specific algorithm's path
   * @param {string} algorithm - Algorithm name
   */
  showAlgorithmPath(algorithm) {
    this._clearHighlights();
    
    const result = this.game.algorithmResults[algorithm];
    if (result && result.path) {
      this.highlightedPath = {
        path: result.path,
        algorithm
      };
      this.render();
    }
  }
}

/**
 * Initialize the TSP UI when the page loads
 */
document.addEventListener('DOMContentLoaded', async () => {
  const ui = new TSPUI();
  await ui.initialize();
});

// Export the class
export { TSPUI };
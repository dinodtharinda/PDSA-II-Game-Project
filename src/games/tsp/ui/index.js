/**
 * UI Component for Traveling Salesman Problem
 * This file handles the user interface interactions for the TSP game
 */

import TSPGame from '../game.js';

class TSPUI {
    constructor() {
        this.game = new TSPGame();
        this.cityElements = {};
        this.routeLines = [];
        this.canvas = null;
        this.ctx = null;
        this.cityPositions = {};
        this.initialized = false;
    }

    /**
     * Initialize the UI
     */
    init() {
        if (this.initialized) return;
        this.initialized = true;

        this.setupCanvas();
        this.setupCityElements();
        this.updateCityInfo();
        this.bindEventHandlers();
    }

    /**
     * Set up canvas for route visualization
     */
    setupCanvas() {
        this.canvas = document.getElementById('tsp-canvas');
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    /**
     * Resize canvas based on container size
     */
    resizeCanvas() {
        if (!this.canvas) return;
        
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        
        this.calculateCityPositions();
        this.drawCities();
        this.drawRoute();
    }

    /**
     * Set up city elements for user interaction
     */
    setupCityElements() {
        const cityContainer = document.getElementById('city-container');
        if (!cityContainer) return;
        
        cityContainer.innerHTML = '';
        
        this.game.cities.forEach(city => {
            const cityElement = document.createElement('div');
            cityElement.className = 'city-node';
            cityElement.dataset.city = city;
            cityElement.innerHTML = `<span>${city}</span>`;
            
            if (city === this.game.homeCity) {
                cityElement.classList.add('home-city');
                cityElement.title = 'Home City';
            }
            
            cityContainer.appendChild(cityElement);
            this.cityElements[city] = cityElement;
        });
        
        this.calculateCityPositions();
    }

    /**
     * Calculate positions for cities on canvas
     */
    calculateCityPositions() {
        if (!this.canvas) return;
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(centerX, centerY) * 0.8;
        
        this.game.cities.forEach((city, index) => {
            const angle = (index / this.game.cities.length) * 2 * Math.PI;
            this.cityPositions[city] = {
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle)
            };
        });
    }

    /**
     * Draw cities on canvas
     */
    drawCities() {
        if (!this.ctx || !this.canvas) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        Object.entries(this.cityPositions).forEach(([city, position]) => {
            this.ctx.beginPath();
            
            if (city === this.game.homeCity) {
                this.ctx.arc(position.x, position.y, 20, 0, 2 * Math.PI);
                this.ctx.fillStyle = '#007bff';
            } else {
                this.ctx.arc(position.x, position.y, 15, 0, 2 * Math.PI);
                this.ctx.fillStyle = '#6c757d';
            }
            
            if (this.game.selectedRoute.includes(city)) {
                this.ctx.lineWidth = 3;
                this.ctx.strokeStyle = '#28a745';
                this.ctx.stroke();
            }
            
            this.ctx.fill();
            
            this.ctx.fillStyle = '#ffffff';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.fillText(city, position.x, position.y);
        });
    }

    /**
     * Draw current route on canvas
     */
    drawRoute(route = null) {
        if (!this.ctx || !this.canvas) return;
        
        const routeToDisplay = route || this.game.selectedRoute;
        if (routeToDisplay.length <= 1) return;
        
        this.ctx.beginPath();
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = '#28a745';
        
        const startCity = routeToDisplay[0];
        const startPos = this.cityPositions[startCity];
        this.ctx.moveTo(startPos.x, startPos.y);
        
        for (let i = 1; i < routeToDisplay.length; i++) {
            const city = routeToDisplay[i];
            const pos = this.cityPositions[city];
            this.ctx.lineTo(pos.x, pos.y);
        }
        
        // If route is complete, connect back to start
        if (this.game.isCompleteTour() && !route) {
            this.ctx.lineTo(startPos.x, startPos.y);
        }
        
        this.ctx.stroke();
    }

    /**
     * Draw algorithm-specific route with distinctive color
     */
    drawAlgorithmRoute(route, color) {
        if (!this.ctx || !this.canvas || !route || route.length <= 1) return;
        
        this.ctx.beginPath();
        this.ctx.lineWidth = 3;
        this.ctx.strokeStyle = color;
        
        const startCity = route[0];
        const startPos = this.cityPositions[startCity];
        this.ctx.moveTo(startPos.x, startPos.y);
        
        for (let i = 1; i < route.length; i++) {
            const city = route[i];
            const pos = this.cityPositions[city];
            this.ctx.lineTo(pos.x, pos.y);
        }
        
        // Connect back to start
        this.ctx.lineTo(startPos.x, startPos.y);
        this.ctx.stroke();
    }

    /**
     * Update city info display
     */
    updateCityInfo() {
        const homeCityElement = document.getElementById('home-city');
        if (homeCityElement) {
            homeCityElement.textContent = this.game.homeCity;
        }
        
        const selectedRouteElement = document.getElementById('selected-route');
        if (selectedRouteElement) {
            selectedRouteElement.textContent = this.game.selectedRoute.join(' → ');
        }
        
        const routeDistanceElement = document.getElementById('route-distance');
        if (routeDistanceElement) {
            const distance = this.game.calculateRouteDistance(this.game.selectedRoute);
            routeDistanceElement.textContent = distance + ' km';
        }
        
        // Update city node styling
        Object.entries(this.cityElements).forEach(([city, element]) => {
            if (this.game.selectedRoute.includes(city)) {
                element.classList.add('selected');
            } else {
                element.classList.remove('selected');
            }
        });
        
        // Update unvisited cities list
        const unvisitedContainer = document.getElementById('unvisited-cities');
        if (unvisitedContainer) {
            const unvisitedCities = this.game.getUnvisitedCities();
            
            if (unvisitedCities.length === 0) {
                unvisitedContainer.innerHTML = '<span class="text-success">All cities visited!</span>';
            } else {
                unvisitedContainer.textContent = 'Unvisited: ' + unvisitedCities.join(', ');
            }
        }
    }

    /**
     * Bind event handlers for user interaction
     */
    bindEventHandlers() {
        // Add city click handlers
        Object.entries(this.cityElements).forEach(([city, element]) => {
            element.addEventListener('click', () => this.handleCityClick(city));
        });
        
        // Game control buttons
        const resetButton = document.getElementById('reset-game');
        if (resetButton) {
            resetButton.addEventListener('click', () => this.resetGame());
        }
        
        // Algorithm buttons
        const nnButton = document.getElementById('nn-algorithm');
        if (nnButton) {
            nnButton.addEventListener('click', () => this.runNearestNeighbor());
        }
        
        const dpButton = document.getElementById('dp-algorithm');
        if (dpButton) {
            dpButton.addEventListener('click', () => this.runDynamicProgramming());
        }
        
        const gaButton = document.getElementById('ga-algorithm');
        if (gaButton) {
            gaButton.addEventListener('click', () => this.runGeneticAlgorithm());
        }
        
        const compareButton = document.getElementById('compare-algorithms');
        if (compareButton) {
            compareButton.addEventListener('click', () => this.compareAlgorithms());
        }
    }

    /**
     * Handle city click to add to route
     */
    handleCityClick(city) {
        try {
            if (!this.game.selectedRoute.includes(city)) {
                this.game.addCityToRoute(city);
                this.updateCityInfo();
                this.drawCities();
                this.drawRoute();
            }
        } catch (error) {
            this.showMessage(error.message, 'error');
        }
    }

    /**
     * Reset the game with new cities and distances
     */
    resetGame() {
        this.game.resetGame();
        this.setupCityElements();
        this.updateCityInfo();
        this.drawCities();
        
        // Clear algorithm results
        const resultsContainer = document.getElementById('algorithm-results');
        if (resultsContainer) {
            resultsContainer.innerHTML = '';
        }
        
        this.showMessage('Game reset with a new distance matrix and home city', 'info');
    }

    /**
     * Show a message to the user
     */
    showMessage(message, type = 'info') {
        const messageElement = document.getElementById('tsp-message');
        if (!messageElement) return;
        
        messageElement.className = 'message-area message-' + type;
        messageElement.textContent = message;
        
        // Auto clear non-error messages
        if (type !== 'error') {
            setTimeout(() => {
                messageElement.textContent = '';
                messageElement.className = 'message-area';
            }, 5000);
        }
    }

    /**
     * Run Nearest Neighbor algorithm
     */
    async runNearestNeighbor() {
        this.showMessage('Running Nearest Neighbor algorithm...', 'info');
        
        setTimeout(async () => {
            try {
                // Import the algorithm dynamically
                const { default: nearestNeighbor } = await import('../algorithms/nearestNeighbor.js');
                const result = this.game.runAlgorithm('Nearest Neighbor', nearestNeighbor);
                
                // Draw the result route
                this.drawCities();
                this.drawAlgorithmRoute(result.route, '#007bff');
                
                // Show result in the UI
                this.displayAlgorithmResult('Nearest Neighbor', result);
                
                this.showMessage('Nearest Neighbor algorithm completed!', 'success');
            } catch (error) {
                this.showMessage('Error running Nearest Neighbor algorithm: ' + error.message, 'error');
            }
        }, 100);
    }

    /**
     * Run Dynamic Programming algorithm
     */
    async runDynamicProgramming() {
        this.showMessage('Running Dynamic Programming algorithm (this may take a moment)...', 'info');
        
        setTimeout(async () => {
            try {
                // Import the algorithm dynamically
                const { default: dynamicProgramming } = await import('../algorithms/dynamicProgramming.js');
                const result = this.game.runAlgorithm('Dynamic Programming', dynamicProgramming);
                
                // Draw the result route
                this.drawCities();
                this.drawAlgorithmRoute(result.route, '#dc3545');
                
                // Show result in the UI
                this.displayAlgorithmResult('Dynamic Programming', result);
                
                this.showMessage('Dynamic Programming algorithm completed!', 'success');
            } catch (error) {
                this.showMessage('Error running Dynamic Programming algorithm: ' + error.message, 'error');
            }
        }, 100);
    }

    /**
     * Run Genetic Algorithm
     */
    async runGeneticAlgorithm() {
        this.showMessage('Running Genetic Algorithm...', 'info');
        
        setTimeout(async () => {
            try {
                // Import the algorithm dynamically
                const { default: geneticAlgorithm } = await import('../algorithms/geneticAlgorithm.js');
                const result = this.game.runAlgorithm('Genetic Algorithm', geneticAlgorithm);
                
                // Draw the result route
                this.drawCities();
                this.drawAlgorithmRoute(result.route, '#28a745');
                
                // Show result in the UI
                this.displayAlgorithmResult('Genetic Algorithm', result);
                
                this.showMessage('Genetic Algorithm completed!', 'success');
            } catch (error) {
                this.showMessage('Error running Genetic Algorithm: ' + error.message, 'error');
            }
        }, 100);
    }

    /**
     * Run and compare all algorithms
     */
    async compareAlgorithms() {
        this.showMessage('Comparing all algorithms...', 'info');
        
        setTimeout(async () => {
            try {
                // Run all algorithms if not already run
                if (!this.game.algorithmResults['Nearest Neighbor']) {
                    const { default: nearestNeighbor } = await import('../algorithms/nearestNeighbor.js');
                    this.game.runAlgorithm('Nearest Neighbor', nearestNeighbor);
                }
                
                if (!this.game.algorithmResults['Dynamic Programming']) {
                    const { default: dynamicProgramming } = await import('../algorithms/dynamicProgramming.js');
                    this.game.runAlgorithm('Dynamic Programming', dynamicProgramming);
                }
                
                if (!this.game.algorithmResults['Genetic Algorithm']) {
                    const { default: geneticAlgorithm } = await import('../algorithms/geneticAlgorithm.js');
                    this.game.runAlgorithm('Genetic Algorithm', geneticAlgorithm);
                }
                
                // Display comparison results
                this.displayAlgorithmComparison();
                
                this.showMessage('Algorithm comparison completed!', 'success');
            } catch (error) {
                this.showMessage('Error comparing algorithms: ' + error.message, 'error');
            }
        }, 100);
    }

    /**
     * Display results for a specific algorithm
     */
    displayAlgorithmResult(name, result) {
        const resultsContainer = document.getElementById('algorithm-results');
        if (!resultsContainer) return;
        
        // Check if result already exists
        let resultElement = document.getElementById(`${name.replace(/\s+/g, '-').toLowerCase()}-result`);
        if (!resultElement) {
            resultElement = document.createElement('div');
            resultElement.id = `${name.replace(/\s+/g, '-').toLowerCase()}-result`;
            resultElement.className = 'algorithm-result';
            resultsContainer.appendChild(resultElement);
        }
        
        // Set color based on algorithm
        let color = '#6c757d';
        if (name === 'Nearest Neighbor') color = '#007bff';
        else if (name === 'Dynamic Programming') color = '#dc3545';
        else if (name === 'Genetic Algorithm') color = '#28a745';
        
        // Convert route to displayable format if needed
        const routeDisplay = result.route.join(' → ') + ` → ${result.route[0]}`;
        
        // Create card with result details
        resultElement.innerHTML = `
            <div class="card mb-3">
                <div class="card-header" style="background-color: ${color}; color: white;">
                    <h5 class="m-0">${name} Result</h5>
                </div>
                <div class="card-body">
                    <p><strong>Route:</strong> ${routeDisplay}</p>
                    <p><strong>Distance:</strong> ${result.distance.toFixed(2)} km</p>
                    <p><strong>Execution Time:</strong> ${result.executionTime.toFixed(2)} ms</p>
                    <button class="btn btn-sm visualize-btn" style="background-color: ${color}; color: white;" 
                            data-algorithm="${name}">
                        Visualize Route
                    </button>
                </div>
            </div>
        `;
        
        // Add event listener to visualize button
        const visualizeBtn = resultElement.querySelector('.visualize-btn');
        if (visualizeBtn) {
            visualizeBtn.addEventListener('click', () => {
                this.drawCities();
                this.drawAlgorithmRoute(result.route, color);
            });
        }
    }

    /**
     * Display comparison of all algorithm results
     */
    displayAlgorithmComparison() {
        const results = this.game.compareAlgorithms();
        if (Object.keys(results).length === 0) return;
        
        // Find optimal algorithm
        let optimalAlgorithm = '';
        let optimalDistance = Infinity;
        
        Object.entries(results).forEach(([name, result]) => {
            if (result.distance < optimalDistance) {
                optimalDistance = result.distance;
                optimalAlgorithm = name;
            }
        });
        
        // Display each algorithm's result
        Object.entries(results).forEach(([name, result]) => {
            this.displayAlgorithmResult(name, result);
        });
        
        // Add comparison section
        const resultsContainer = document.getElementById('algorithm-results');
        if (!resultsContainer) return;
        
        // Create or update comparison element
        let comparisonElement = document.getElementById('algorithm-comparison');
        if (!comparisonElement) {
            comparisonElement = document.createElement('div');
            comparisonElement.id = 'algorithm-comparison';
            comparisonElement.className = 'algorithm-comparison mt-4';
            resultsContainer.appendChild(comparisonElement);
        }
        
        // Create comparison table rows
        let tableRows = '';
        Object.entries(results).forEach(([name, result]) => {
            const percentDiff = ((result.distance / optimalDistance) - 1) * 100;
            const isOptimal = name === optimalAlgorithm;
            
            tableRows += `
                <tr class="${isOptimal ? 'table-success' : ''}">
                    <td>${name}</td>
                    <td>${result.distance.toFixed(2)} km</td>
                    <td>${isOptimal ? '0%' : percentDiff.toFixed(2) + '%'}</td>
                    <td>${result.executionTime.toFixed(2)} ms</td>
                </tr>
            `;
        });
        
        // Create comparison card
        comparisonElement.innerHTML = `
            <div class="card">
                <div class="card-header bg-primary text-white">
                    <h5 class="m-0">Algorithm Comparison</h5>
                </div>
                <div class="card-body">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>Algorithm</th>
                                <th>Distance</th>
                                <th>% vs Best</th>
                                <th>Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRows}
                        </tbody>
                    </table>
                    <div class="mt-3">
                        <p><strong>Best Algorithm:</strong> ${optimalAlgorithm} with ${optimalDistance.toFixed(2)} km</p>
                    </div>
                </div>
            </div>
        `;
        
        // Draw the optimal route
        this.drawCities();
        this.drawAlgorithmRoute(results[optimalAlgorithm].route, '#28a745');
    }
}

export default TSPUI;
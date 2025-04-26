/**
 * Traveling Salesman Problem client-side script
 * This file handles the UI components for the TSP game
 * The algorithms are now implemented on the server side for better performance
 */

// Global TSP UI object
let tspUI = null;

// Main initialization function
document.addEventListener('DOMContentLoaded', function() {
    initTSPGame();
});

// Initialize the TSP Game
function initTSPGame() {
    // Create game instance
    tspUI = new TSPUI();
    
    // Set as global for button access
    window.tspUI = tspUI;
    
    // Initialize UI
    tspUI.init();
}

/**
 * TSP Game class
 */
class TSPGame {
    constructor() {
        this.cities = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
        this.cityCount = this.cities.length;
        this.distanceMatrix = [];
        this.homeCity = null;
        this.selectedRoute = [];
        this.optimalRoute = null;
        this.optimalDistance = Infinity;
        this.algorithmResults = {};
        this.resetGame();
    }

    resetGame() {
        this.generateDistanceMatrix();
        this.selectHomeCity();
        this.selectedRoute = [this.homeCity];
        this.optimalRoute = null;
        this.optimalDistance = Infinity;
        this.algorithmResults = {};
        console.log('TSP game reset with home city: ' + this.homeCity);
    }

    generateDistanceMatrix() {
        this.distanceMatrix = [];
        
        // Initialize with zeros
        for (let i = 0; i < this.cityCount; i++) {
            this.distanceMatrix[i] = [];
            for (let j = 0; j < this.cityCount; j++) {
                this.distanceMatrix[i][j] = 0;
            }
        }
        
        // Fill with random distances (50-100 km)
        for (let i = 0; i < this.cityCount; i++) {
            for (let j = i + 1; j < this.cityCount; j++) {
                const distance = Math.floor(Math.random() * 51) + 50; // 50-100 km
                this.distanceMatrix[i][j] = distance;
                this.distanceMatrix[j][i] = distance; // Symmetric matrix
            }
        }
        
        return this.distanceMatrix;
    }

    selectHomeCity() {
        const randomIndex = Math.floor(Math.random() * this.cityCount);
        this.homeCity = this.cities[randomIndex];
        return this.homeCity;
    }

    getDistance(cityA, cityB) {
        const indexA = this.cities.indexOf(cityA);
        const indexB = this.cities.indexOf(cityB);
        
        if (indexA === -1 || indexB === -1) {
            throw new Error('Invalid city specified');
        }
        
        return this.distanceMatrix[indexA][indexB];
    }

    addCityToRoute(city) {
        if (!this.cities.includes(city)) {
            throw new Error('Invalid city specified');
        }
        
        if (this.selectedRoute.includes(city)) {
            throw new Error('City already in route');
        }
        
        this.selectedRoute.push(city);
        return this.selectedRoute;
    }

    calculateRouteDistance(route) {
        if (!route || route.length <= 1) {
            return 0;
        }
        
        let totalDistance = 0;
        
        for (let i = 0; i < route.length - 1; i++) {
            totalDistance += this.getDistance(route[i], route[i + 1]);
        }
        
        // Add return to home city if route is complete
        if (route.length === this.cityCount && route[0] === this.homeCity) {
            totalDistance += this.getDistance(route[route.length - 1], route[0]);
        }
        
        return totalDistance;
    }

    getUnvisitedCities() {
        return this.cities.filter(city => !this.selectedRoute.includes(city));
    }

    isCompleteTour() {
        return this.selectedRoute.length === this.cityCount && 
               this.selectedRoute[0] === this.homeCity;
    }

    /**
     * Run algorithm on the server
     * @param {string} algorithmName - Name of the algorithm to run
     * @returns {Promise<Object>} - Promise resolving to the algorithm result
     */
    async runServerAlgorithm(algorithmName) {
        try {
            const response = await fetch('/api/games/traveling-salesman/solve', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    algorithm: algorithmName,
                    distanceMatrix: this.distanceMatrix,
                    homeCity: this.cities.indexOf(this.homeCity)
                })
            });

            if (!response.ok) {
                throw new Error('Server error');
            }

            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Failed to solve the problem');
            }

            const executionTime = data.executionTime;
            const route = data.route.map(index => this.cities[index]);
            const distance = data.distance;

            // Store the result
            this.algorithmResults[algorithmName] = {
                route,
                distance,
                executionTime
            };
            
            console.log(`Algorithm ${algorithmName} completed in ${executionTime.toFixed(2)}ms`);
            
            // Update optimal route if better
            if (distance < this.optimalDistance) {
                this.optimalRoute = route;
                this.optimalDistance = distance;
            }
            
            return this.algorithmResults[algorithmName];
        } catch (error) {
            console.error(`Error running ${algorithmName} algorithm:`, error);
            throw error;
        }
    }

    compareAlgorithms() {
        return this.algorithmResults;
    }
}

/**
 * TSP UI class for handling the user interface
 */
class TSPUI {
    constructor() {
        this.game = new TSPGame();
        this.cityElements = {};
        this.routeLines = [];
        this.canvas = null;
        this.ctx = null;
        this.cityPositions = {};
        this.initialized = false;
        this.solveInProgress = false;
        
        // Bind methods
        this.handleCityClick = this.handleCityClick.bind(this);
        this.handleResetGame = this.handleResetGame.bind(this);
        this.runNearestNeighbor = this.runNearestNeighbor.bind(this);
        this.runDynamicProgramming = this.runDynamicProgramming.bind(this);
        this.runGeneticAlgorithm = this.runGeneticAlgorithm.bind(this);
        this.compareAlgorithms = this.compareAlgorithms.bind(this);
    }

    init() {
        if (this.initialized) return;
        this.initialized = true;

        // Set up canvas
        this.canvas = document.getElementById('tsp-canvas');
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
            this.resizeCanvas();
            window.addEventListener('resize', () => this.resizeCanvas());
        }

        // Set up city elements and event handlers
        this.setupCityElements();
        this.updateCityInfo();
        this.bindEventHandlers();
        this.drawCities();
    }

    resizeCanvas() {
        if (!this.canvas) return;
        
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        
        this.calculateCityPositions();
        this.drawCities();
        this.drawRoute();
    }

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
            
            cityElement.addEventListener('click', () => this.handleCityClick(city));
        });
        
        this.calculateCityPositions();
    }

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
        
        if (this.game.isCompleteTour() && !route) {
            this.ctx.lineTo(startPos.x, startPos.y);
        }
        
        this.ctx.stroke();
    }

    drawAlgorithmRoute(route, color) {
        if (!this.ctx || !this.canvas || !route || route.length <= 1) return;
        
        const cityRoute = Array.isArray(route[0]) || typeof route[0] === 'number'
            ? route.map(idx => this.game.cities[idx])
            : route;
        
        this.ctx.beginPath();
        this.ctx.lineWidth = 3;
        this.ctx.strokeStyle = color;
        
        const startCity = cityRoute[0];
        const startPos = this.cityPositions[startCity];
        this.ctx.moveTo(startPos.x, startPos.y);
        
        for (let i = 1; i < cityRoute.length; i++) {
            const city = cityRoute[i];
            const pos = this.cityPositions[city];
            this.ctx.lineTo(pos.x, pos.y);
        }
        
        this.ctx.lineTo(startPos.x, startPos.y);
        this.ctx.stroke();
    }

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
        
        Object.entries(this.cityElements).forEach(([city, element]) => {
            if (this.game.selectedRoute.includes(city)) {
                element.classList.add('selected');
            } else {
                element.classList.remove('selected');
            }
        });
        
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

    bindEventHandlers() {
        const resetButton = document.getElementById('reset-game');
        if (resetButton) {
            resetButton.addEventListener('click', this.handleResetGame);
        }
        
        const nnButton = document.getElementById('nn-algorithm');
        if (nnButton) {
            nnButton.addEventListener('click', this.runNearestNeighbor);
        }
        
        const dpButton = document.getElementById('dp-algorithm');
        if (dpButton) {
            dpButton.addEventListener('click', this.runDynamicProgramming);
        }
        
        const gaButton = document.getElementById('ga-algorithm');
        if (gaButton) {
            gaButton.addEventListener('click', this.runGeneticAlgorithm);
        }
        
        const compareButton = document.getElementById('compare-algorithms');
        if (compareButton) {
            compareButton.addEventListener('click', this.compareAlgorithms);
        }
    }

    handleCityClick(city) {
        if (this.solveInProgress) return;
        
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

    handleResetGame() {
        this.game.resetGame();
        this.setupCityElements();
        this.updateCityInfo();
        this.drawCities();
        
        const resultsContainer = document.getElementById('algorithm-results');
        if (resultsContainer) {
            resultsContainer.innerHTML = '';
        }
        
        this.showMessage('Game reset with a new distance matrix and home city', 'info');
    }

    showMessage(message, type = 'info') {
        const messageElement = document.getElementById('tsp-message');
        if (!messageElement) return;
        
        messageElement.className = 'message-area message-' + type;
        messageElement.textContent = message;
        
        if (type !== 'error') {
            setTimeout(() => {
                messageElement.textContent = '';
                messageElement.className = 'message-area';
            }, 5000);
        }
    }

    async runNearestNeighbor() {
        if (this.solveInProgress) return;
        this.solveInProgress = true;
        
        this.showMessage('Running Nearest Neighbor algorithm...', 'info');
        
        try {
            // Run algorithm on server
            const result = await this.game.runServerAlgorithm('NearestNeighbor');
                
            // Draw the result route
            this.drawCities();
            this.drawAlgorithmRoute(result.route, '#007bff');
                
            // Show result in the UI
            this.displayAlgorithmResult('Nearest Neighbor', result);
                
            this.showMessage('Nearest Neighbor algorithm completed!', 'success');
        } catch (error) {
            this.showMessage('Error running Nearest Neighbor algorithm: ' + error.message, 'error');
        } finally {
            this.solveInProgress = false;
        }
    }

    async runDynamicProgramming() {
        if (this.solveInProgress) return;
        this.solveInProgress = true;
        
        this.showMessage('Running Dynamic Programming algorithm (this may take a moment)...', 'info');
        
        try {
            // Run algorithm on server
            const result = await this.game.runServerAlgorithm('DynamicProgramming');
                
            // Draw the result route
            this.drawCities();
            this.drawAlgorithmRoute(result.route, '#dc3545');
                
            // Show result in the UI
            this.displayAlgorithmResult('Dynamic Programming', result);
                
            this.showMessage('Dynamic Programming algorithm completed!', 'success');
        } catch (error) {
            this.showMessage('Error running Dynamic Programming algorithm: ' + error.message, 'error');
        } finally {
            this.solveInProgress = false;
        }
    }

    async runGeneticAlgorithm() {
        if (this.solveInProgress) return;
        this.solveInProgress = true;
        
        this.showMessage('Running Genetic Algorithm...', 'info');
        
        try {
            // Run algorithm on server
            const result = await this.game.runServerAlgorithm('GeneticAlgorithm');
                
            // Draw the result route
            this.drawCities();
            this.drawAlgorithmRoute(result.route, '#28a745');
                
            // Show result in the UI
            this.displayAlgorithmResult('Genetic Algorithm', result);
                
            this.showMessage('Genetic Algorithm completed!', 'success');
        } catch (error) {
            this.showMessage('Error running Genetic Algorithm: ' + error.message, 'error');
        } finally {
            this.solveInProgress = false;
        }
    }

    async compareAlgorithms() {
        if (this.solveInProgress) return;
        this.solveInProgress = true;
        
        this.showMessage('Comparing all algorithms...', 'info');
        
        try {
            // Run all algorithms if not already run
            if (!this.game.algorithmResults['NearestNeighbor']) {
                await this.game.runServerAlgorithm('NearestNeighbor');
            }
            
            if (!this.game.algorithmResults['DynamicProgramming']) {
                await this.game.runServerAlgorithm('DynamicProgramming');
            }
            
            if (!this.game.algorithmResults['GeneticAlgorithm']) {
                await this.game.runServerAlgorithm('GeneticAlgorithm');
            }
            
            // Display comparison results
            this.displayAlgorithmComparison();
            
            this.showMessage('Algorithm comparison completed!', 'success');
        } catch (error) {
            this.showMessage('Error comparing algorithms: ' + error.message, 'error');
        } finally {
            this.solveInProgress = false;
        }
    }

    displayAlgorithmResult(name, result) {
        const resultsContainer = document.getElementById('algorithm-results');
        if (!resultsContainer) return;
        
        let resultElement = document.getElementById(`${name.replace(/\s+/g, '-').toLowerCase()}-result`);
        if (!resultElement) {
            resultElement = document.createElement('div');
            resultElement.id = `${name.replace(/\s+/g, '-').toLowerCase()}-result`;
            resultElement.className = 'algorithm-result';
            resultsContainer.appendChild(resultElement);
        }
        
        let color = '#6c757d';
        if (name === 'Nearest Neighbor') color = '#007bff';
        else if (name === 'Dynamic Programming') color = '#dc3545';
        else if (name === 'Genetic Algorithm') color = '#28a745';
        
        const routeDisplay = result.route.map(city => 
            typeof city === 'number' ? this.game.cities[city] : city
        ).join(' → ') + ` → ${result.route[0]}`;
        
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
                            data-route='${JSON.stringify(result.route)}' data-color='${color}'>
                        Visualize Route
                    </button>
                </div>
            </div>
        `;
        
        // Add event listener to visualize button
        const visualizeBtn = resultElement.querySelector('.visualize-btn');
        if (visualizeBtn) {
            visualizeBtn.addEventListener('click', (e) => {
                const route = JSON.parse(e.target.dataset.route);
                const color = e.target.dataset.color;
                this.drawCities();
                this.drawAlgorithmRoute(route, color);
            });
        }
    }

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
        
        let comparisonElement = document.getElementById('algorithm-comparison');
        if (!comparisonElement) {
            comparisonElement = document.createElement('div');
            comparisonElement.id = 'algorithm-comparison';
            comparisonElement.className = 'algorithm-comparison mt-4';
            resultsContainer.appendChild(comparisonElement);
        }
        
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
                        <p><strong>Best Algorithm:</strong> ${optimalAlgorithm} (${optimalDistance.toFixed(2)} km)</p>
                    </div>
                </div>
            </div>
        `;
        
        // Draw the optimal route
        this.drawCities();
        this.drawAlgorithmRoute(results[optimalAlgorithm].route, '#28a745');
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const tspUI = new TSPUI();
    tspUI.init();
    
    // Export for debugging
    window.TSPGame = TSPGame;
    window.TSPUI = tspUI;
});
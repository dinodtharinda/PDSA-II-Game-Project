/**
 * TSP Game bundle for browser use
 * This file handles the browser-side implementation of the TSP game
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

    runAlgorithm(algorithmName, algorithm) {
        const startTime = performance.now();
        const result = algorithm(this.distanceMatrix, this.cities, this.cities.indexOf(this.homeCity));
        const endTime = performance.now();
        
        const executionTime = endTime - startTime;
        const route = result.route.map(index => this.cities[index]);
        const distance = result.distance;
        
        this.algorithmResults[algorithmName] = {
            route,
            distance,
            executionTime
        };
        
        console.log(`Algorithm ${algorithmName} completed in ${executionTime.toFixed(2)}ms`);
        
        if (distance < this.optimalDistance) {
            this.optimalRoute = route;
            this.optimalDistance = distance;
        }
        
        return this.algorithmResults[algorithmName];
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

    runNearestNeighbor() {
        if (this.solveInProgress) return;
        this.solveInProgress = true;
        
        this.showMessage('Running Nearest Neighbor algorithm...', 'info');
        
        setTimeout(() => {
            try {
                const startTime = performance.now();
                const result = this.game.runAlgorithm('NearestNeighbor', nearestNeighbor);
                const endTime = performance.now();
                
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
        }, 100);
    }

    runDynamicProgramming() {
        if (this.solveInProgress) return;
        this.solveInProgress = true;
        
        this.showMessage('Running Dynamic Programming algorithm (this may take a moment)...', 'info');
        
        setTimeout(() => {
            try {
                const startTime = performance.now();
                const result = this.game.runAlgorithm('DynamicProgramming', dynamicProgramming);
                const endTime = performance.now();
                
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
        }, 100);
    }

    runGeneticAlgorithm() {
        if (this.solveInProgress) return;
        this.solveInProgress = true;
        
        this.showMessage('Running Genetic Algorithm...', 'info');
        
        setTimeout(() => {
            try {
                const startTime = performance.now();
                const result = this.game.runAlgorithm('GeneticAlgorithm', geneticAlgorithm);
                const endTime = performance.now();
                
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
        }, 100);
    }

    compareAlgorithms() {
        if (this.solveInProgress) return;
        this.solveInProgress = true;
        
        this.showMessage('Comparing all algorithms...', 'info');
        
        setTimeout(() => {
            try {
                // Run all algorithms if not already run
                if (!this.game.algorithmResults['NearestNeighbor']) {
                    this.game.runAlgorithm('NearestNeighbor', nearestNeighbor);
                }
                
                if (!this.game.algorithmResults['DynamicProgramming']) {
                    this.game.runAlgorithm('DynamicProgramming', dynamicProgramming);
                }
                
                if (!this.game.algorithmResults['GeneticAlgorithm']) {
                    this.game.runAlgorithm('GeneticAlgorithm', geneticAlgorithm);
                }
                
                // Display comparison results
                this.displayAlgorithmComparison();
                
                this.showMessage('Algorithm comparison completed!', 'success');
            } catch (error) {
                this.showMessage('Error comparing algorithms: ' + error.message, 'error');
            } finally {
                this.solveInProgress = false;
            }
        }, 100);
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

/**
 * Nearest Neighbor algorithm implementation for TSP
 */
function nearestNeighbor(distanceMatrix, cities, startIndex) {
    const n = distanceMatrix.length;
    const visited = new Array(n).fill(false);
    const route = [startIndex];
    let totalDistance = 0;
    let currentCity = startIndex;

    visited[startIndex] = true;

    // Visit n-1 more cities (all except starting city)
    for (let i = 1; i < n; i++) {
        let nearestCity = -1;
        let shortestDistance = Infinity;

        // Find nearest unvisited city
        for (let j = 0; j < n; j++) {
            if (!visited[j] && distanceMatrix[currentCity][j] < shortestDistance) {
                nearestCity = j;
                shortestDistance = distanceMatrix[currentCity][j];
            }
        }

        if (nearestCity !== -1) {
            visited[nearestCity] = true;
            route.push(nearestCity);
            totalDistance += shortestDistance;
            currentCity = nearestCity;
        }
    }

    // Return to start
    totalDistance += distanceMatrix[currentCity][startIndex];
    
    return {
        route: route,
        distance: totalDistance
    };
}

/**
 * Dynamic Programming algorithm implementation for TSP (Held-Karp)
 */
function dynamicProgramming(distanceMatrix, cities, startIndex) {
    const n = distanceMatrix.length;
    
    // For small instances, use brute force
    if (n <= 3) {
        return bruteForce(distanceMatrix, startIndex);
    }
    
    // Memoization storage
    const dp = {};
    const path = {};
    
    // Calculate minimum cost
    const cost = solve(1 << startIndex, startIndex);
    
    // Reconstruct path
    const route = reconstructPath(1 << startIndex, startIndex);
    
    return {
        route: route,
        distance: cost
    };
    
    // Recursive function with memoization
    function solve(mask, pos) {
        // If all cities visited, return to start
        if (mask === (1 << n) - 1) {
            return distanceMatrix[pos][startIndex];
        }
        
        // Check for memoized result
        const key = `${mask},${pos}`;
        if (dp[key] !== undefined) {
            return dp[key];
        }
        
        let ans = Infinity;
        let bestNext = -1;
        
        // Try each unvisited city
        for (let city = 0; city < n; city++) {
            if ((mask & (1 << city)) === 0) { // If not visited
                const newCost = distanceMatrix[pos][city] + solve(mask | (1 << city), city);
                if (newCost < ans) {
                    ans = newCost;
                    bestNext = city;
                }
            }
        }
        
        // Store the best path
        path[key] = bestNext;
        
        // Memoize and return
        return dp[key] = ans;
    }
    
    // Reconstruct the path from memoization
    function reconstructPath(mask, pos) {
        const result = [startIndex];
        let currentMask = mask;
        let currentPos = pos;
        
        while (true) {
            const key = `${currentMask},${currentPos}`;
            const nextCity = path[key];
            
            if (nextCity === undefined || nextCity === -1) {
                break;
            }
            
            result.push(nextCity);
            currentMask |= (1 << nextCity);
            currentPos = nextCity;
            
            if (currentMask === (1 << n) - 1) {
                break;
            }
        }
        
        return result;
    }
}

/**
 * Brute force approach for very small TSP instances
 */
function bruteForce(distanceMatrix, startIndex) {
    const n = distanceMatrix.length;
    const cities = Array.from({length: n}, (_, i) => i);
    
    // Create all permutations of cities (excluding start)
    const otherCities = cities.filter(c => c !== startIndex);
    const permutations = getPermutations(otherCities);
    
    let minDistance = Infinity;
    let bestRoute = [];
    
    for (const perm of permutations) {
        const route = [startIndex, ...perm];
        
        let distance = 0;
        for (let i = 0; i < route.length - 1; i++) {
            distance += distanceMatrix[route[i]][route[i + 1]];
        }
        
        // Return to start
        distance += distanceMatrix[route[route.length - 1]][startIndex];
        
        if (distance < minDistance) {
            minDistance = distance;
            bestRoute = route;
        }
    }
    
    return {
        route: bestRoute,
        distance: minDistance
    };
}

/**
 * Generate all permutations of an array
 */
function getPermutations(arr) {
    if (arr.length <= 1) return [arr];
    
    const result = [];
    for (let i = 0; i < arr.length; i++) {
        const current = arr[i];
        const remaining = [...arr.slice(0, i), ...arr.slice(i + 1)];
        const remainingPerms = getPermutations(remaining);
        
        for (const perm of remainingPerms) {
            result.push([current, ...perm]);
        }
    }
    
    return result;
}

/**
 * Genetic Algorithm implementation for TSP
 */
function geneticAlgorithm(distanceMatrix, cities, startIndex) {
    const n = distanceMatrix.length;
    
    // Parameters based on problem size
    const params = n <= 10 
        ? { popSize: 50, generations: 100, mutationRate: 0.2, elitismRate: 0.1 }
        : { popSize: 100, generations: 200, mutationRate: 0.1, elitismRate: 0.2 };
    
    return runGeneticAlgorithm(
        distanceMatrix, 
        startIndex, 
        n, 
        params.popSize, 
        params.generations, 
        params.mutationRate,
        params.elitismRate
    );
}

/**
 * Run the Genetic Algorithm with specified parameters
 */
function runGeneticAlgorithm(distanceMatrix, startIndex, n, populationSize, generations, mutationRate, elitismRate) {
    // Initialize population
    let population = initializePopulation(n, startIndex, populationSize);
    
    // Evaluate initial population
    let fitnessScores = population.map(individual => 
        calculateFitness(individual, distanceMatrix, startIndex)
    );
    
    // Track best solution
    let bestIndividual = population[0];
    let bestFitness = fitnessScores[0];
    
    for (let i = 0; i < fitnessScores.length; i++) {
        if (fitnessScores[i] < bestFitness) {
            bestFitness = fitnessScores[i];
            bestIndividual = population[i];
        }
    }
    
    // Evolution loop
    for (let generation = 0; generation < generations; generation++) {
        // Create new generation
        const eliteCount = Math.max(1, Math.floor(populationSize * elitismRate));
        const newPopulation = [];
        
        // Add elite individuals
        const sortedIndices = getSortedIndices(fitnessScores);
        for (let i = 0; i < eliteCount; i++) {
            newPopulation.push([...population[sortedIndices[i]]]);
        }
        
        // Generate rest of population
        while (newPopulation.length < populationSize) {
            // Select parents
            const parent1Index = tournamentSelection(fitnessScores, 3);
            const parent2Index = tournamentSelection(fitnessScores, 3);
            
            // Crossover
            const child = crossover(
                population[parent1Index], 
                population[parent2Index],
                startIndex
            );
            
            // Mutation
            if (Math.random() < mutationRate) {
                mutate(child, startIndex);
            }
            
            newPopulation.push(child);
        }
        
        // Replace old population
        population = newPopulation;
        
        // Evaluate new population
        fitnessScores = population.map(individual => 
            calculateFitness(individual, distanceMatrix, startIndex)
        );
        
        // Update best solution
        for (let i = 0; i < fitnessScores.length; i++) {
            if (fitnessScores[i] < bestFitness) {
                bestFitness = fitnessScores[i];
                bestIndividual = [...population[i]];
            }
        }
    }
    
    return {
        route: bestIndividual,
        distance: bestFitness
    };
}

/**
 * Initialize random population for genetic algorithm
 */
function initializePopulation(n, startIndex, populationSize) {
    const population = [];
    
    for (let i = 0; i < populationSize; i++) {
        const tour = [startIndex];
        
        const remainingCities = [];
        for (let j = 0; j < n; j++) {
            if (j !== startIndex) {
                remainingCities.push(j);
            }
        }
        
        // Fisher-Yates shuffle
        for (let j = remainingCities.length - 1; j > 0; j--) {
            const randomIndex = Math.floor(Math.random() * (j + 1));
            [remainingCities[j], remainingCities[randomIndex]] = 
            [remainingCities[randomIndex], remainingCities[j]];
        }
        
        tour.push(...remainingCities);
        population.push(tour);
    }
    
    return population;
}

/**
 * Calculate fitness (route length) for genetic algorithm
 */
function calculateFitness(individual, distanceMatrix, startIndex) {
    let distance = 0;
    
    for (let i = 0; i < individual.length - 1; i++) {
        distance += distanceMatrix[individual[i]][individual[i + 1]];
    }
    
    // Return to start
    distance += distanceMatrix[individual[individual.length - 1]][startIndex];
    
    return distance;
}

/**
 * Tournament selection for genetic algorithm
 */
function tournamentSelection(fitnessScores, tournamentSize) {
    const population = fitnessScores.length;
    let bestIndex = Math.floor(Math.random() * population);
    let bestFitness = fitnessScores[bestIndex];
    
    for (let i = 1; i < tournamentSize; i++) {
        const candidateIndex = Math.floor(Math.random() * population);
        const candidateFitness = fitnessScores[candidateIndex];
        
        if (candidateFitness < bestFitness) {
            bestIndex = candidateIndex;
            bestFitness = candidateFitness;
        }
    }
    
    return bestIndex;
}

/**
 * Ordered crossover for permutation problems (TSP)
 */
function crossover(parent1, parent2, startIndex) {
    const n = parent1.length;
    
    // Always keep startIndex at the beginning
    const child = [startIndex];
    
    // Choose random segment from parent1
    const startPos = 1 + Math.floor(Math.random() * (n - 2));
    const endPos = 1 + startPos + Math.floor(Math.random() * (n - startPos));
    
    // Copy segment from parent1
    for (let i = startPos; i < endPos; i++) {
        child[i] = parent1[i];
    }
    
    // Fill remaining positions from parent2
    let j = 1;
    
    for (let i = 1; i < n; i++) {
        const city = parent2[i];
        
        if (!child.includes(city)) {
            // Find next unfilled position
            while (j < n && child[j] !== undefined) {
                j++;
            }
            
            if (j < n) {
                child[j] = city;
            }
        }
    }
    
    return child;
}

/**
 * Mutation operator (swap mutation) for genetic algorithm
 */
function mutate(individual, startIndex) {
    const n = individual.length;
    
    // Select two random positions (excluding start city)
    const pos1 = 1 + Math.floor(Math.random() * (n - 1));
    let pos2 = 1 + Math.floor(Math.random() * (n - 1));
    
    // Make sure pos1 != pos2
    while (pos1 === pos2) {
        pos2 = 1 + Math.floor(Math.random() * (n - 1));
    }
    
    // Swap cities
    [individual[pos1], individual[pos2]] = [individual[pos2], individual[pos1]];
    
    return individual;
}

/**
 * Helper function to get indices sorted by fitness
 */
function getSortedIndices(fitnessScores) {
    return Array.from({ length: fitnessScores.length }, (_, i) => i)
        .sort((a, b) => fitnessScores[a] - fitnessScores[b]);
}
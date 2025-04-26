/**
 * Traveling Salesman Problem Game Logic
 * This file handles the core game logic for the TSP game
 */

const Timer = require('../../utils/timer');
const logger = require('../../utils/logger');

class TSPGame {
    constructor() {
        this.cities = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
        this.cityCount = this.cities.length;
        this.distanceMatrix = this.generateDistanceMatrix();
        this.homeCity = this.selectHomeCity();
        this.selectedRoute = [this.homeCity]; // Route always starts with home city
        this.algorithmResults = {};
        this.optimalRoute = null;
        this.optimalDistance = Infinity;
        this.timer = new Timer();
    }

    /**
     * Generate a random distance matrix between cities
     * Distances are between 50-100 km
     * @returns {Array<Array<number>>} A matrix of distances between cities
     */
    generateDistanceMatrix() {
        // Create a 2D array for distance matrix
        const matrix = Array(this.cityCount).fill().map(() => Array(this.cityCount).fill(0));
        
        // Generate random distances between each pair of cities (50-100 km)
        for (let i = 0; i < this.cityCount; i++) {
            for (let j = i + 1; j < this.cityCount; j++) {
                // Generate a random distance between 50 and 100 km
                const distance = Math.floor(Math.random() * 51) + 50;
                matrix[i][j] = distance;
                matrix[j][i] = distance; // Matrix is symmetric
            }
        }
        
        return matrix;
    }

    /**
     * Select the home city (default implementation uses current homeCity)
     * @returns {string} The selected home city
     */
    selectHomeCity() {
        if (!this.homeCity) {
            const randomIndex = Math.floor(Math.random() * this.cities.length);
            return this.cities[randomIndex];
        }
        return this.homeCity;
    }

    /**
     * Select a random city as the home city
     * @returns {string} The selected home city
     */
    selectRandomHomeCity() {
        const randomIndex = Math.floor(Math.random() * this.cities.length);
        return this.cities[randomIndex];
    }

    /**
     * Add a city to the current route
     * @param {string} city - The city to add
     * @returns {Array<string>} The updated route
     * @throws {Error} If the city is invalid or already in the route
     */
    addCityToRoute(city) {
        // Validate city
        if (!this.cities.includes(city)) {
            throw new Error(`Invalid city: ${city}`);
        }
        
        // Special case: Adding home city to complete the tour
        if (city === this.homeCity && this.selectedRoute.length === this.cityCount) {
            // Adding home city at the end to complete the circuit is allowed
            this.selectedRoute.push(city);
            logger.info(`Completed tour: ${this.selectedRoute.join(' -> ')}`);
            return [...this.selectedRoute];
        }
        
        // Check if city is already in the route
        if (this.selectedRoute.includes(city)) {
            logger.info(`City ${city} is already in the route - no changes made`);
            return [...this.selectedRoute]; // Return unchanged route
        }
        
        // Add city to route
        this.selectedRoute.push(city);
        
        logger.info(`Added ${city} to route: ${this.selectedRoute.join(' -> ')}`);
        
        return [...this.selectedRoute];
    }

    /**
     * Get distance between two cities
     * @param {string} cityA - First city
     * @param {string} cityB - Second city
     * @returns {number} The distance in km
     */
    getDistance(cityA, cityB) {
        const indexA = this.cities.indexOf(cityA);
        const indexB = this.cities.indexOf(cityB);
        
        if (indexA === -1 || indexB === -1) {
            throw new Error(`Invalid cities: ${cityA}, ${cityB}`);
        }
        
        return this.distanceMatrix[indexA][indexB];
    }

    /**
     * Calculate the total distance of a route
     * @param {Array<string>} route - The route to calculate
     * @returns {number} The total distance in km
     */
    calculateRouteDistance(route) {
        if (!route || route.length <= 1) return 0;
        
        let totalDistance = 0;
        
        // Calculate distance between each consecutive pair of cities
        for (let i = 0; i < route.length - 1; i++) {
            totalDistance += this.getDistance(route[i], route[i + 1]);
        }
        
        // If the tour is not already a complete circuit, add distance back to home city
        const isCircuit = route[0] === route[route.length - 1];
        if (this.isCompleteTour(route) && !isCircuit) {
            totalDistance += this.getDistance(route[route.length - 1], route[0]);
        }
        
        return totalDistance;
    }

    /**
     * Check if a route forms a complete tour
     * @param {Array<string>} [route=this.selectedRoute] - The route to check
     * @returns {boolean} True if all cities are visited and the tour returns to the home city
     */
    isCompleteTour(route = this.selectedRoute) {
        if (route.length <= 1) return false;
        
        // A complete tour needs to have all cities visited
        const uniqueCities = new Set(route);
        const allCitiesVisited = uniqueCities.size === this.cityCount;
        
        // And it should end at the home city (circuit)
        const returnsHome = route[0] === route[route.length - 1];
        
        return allCitiesVisited && returnsHome;
    }

    /**
     * Get the cities that haven't been visited yet
     * @returns {Array<string>} Array of unvisited cities
     */
    getUnvisitedCities() {
        return this.cities.filter(city => !this.selectedRoute.includes(city));
    }

    /**
     * Reset the game with new distances and home city
     */
    resetGame() {
        this.distanceMatrix = this.generateDistanceMatrix();
        this.homeCity = this.selectRandomHomeCity();
        this.selectedRoute = [this.homeCity];
        this.algorithmResults = {};
        this.optimalRoute = null;
        this.optimalDistance = Infinity;
        logger.info('Game reset with new distances and home city: ' + this.homeCity);
    }

    /**
     * Run a specific algorithm on the TSP instance
     * @param {string} algorithmName - The name of the algorithm to run
     * @param {Function} algorithmFunction - The algorithm function
     * @returns {Object} The algorithm results
     */
    runAlgorithm(algorithmName, algorithmFunction) {
        logger.info(`Running ${algorithmName} algorithm for TSP`);
        
        this.timer.start();
        const route = algorithmFunction(this.distanceMatrix, this.homeCity);
        const executionTime = this.timer.stop();
        
        const distance = this.calculateRouteDistance(route);
        
        const result = {
            route,
            distance,
            executionTime
        };
        
        // Store the result
        this.algorithmResults[algorithmName] = result;
        
        // Update optimal route if this one is better
        if (distance < this.optimalDistance) {
            this.optimalDistance = distance;
            this.optimalRoute = [...route];
        }
        
        logger.info(`${algorithmName} algorithm completed. Distance: ${distance} km, Time: ${executionTime} ms`);
        
        return result;
    }

    /**
     * Run a TSP algorithm via server API
     * @param {string} algorithm - The name of the algorithm to run
     * @returns {Promise<Object>} The algorithm results
     */
    async runServerAlgorithm(algorithm) {
        logger.info(`Running ${algorithm} algorithm for TSP via server API`);
        
        const url = `/api/games/tsp/route/${algorithm}`;
        
        // Convert homeCity to index for API
        const homeCityIndex = this.cities.indexOf(this.homeCity);
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    distanceMatrix: this.distanceMatrix,
                    homeCity: homeCityIndex
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to get TSP solution');
            }
            
            const result = await response.json();
            
            // Store the result
            this.algorithmResults[algorithm] = result;
            
            // Update optimal route if this one is better
            if (result.distance < this.optimalDistance) {
                this.optimalDistance = result.distance;
                this.optimalRoute = [...result.route];
            }
            
            logger.info(`${algorithm} algorithm completed via API. Distance: ${result.distance} km, Time: ${result.executionTime} ms`);
            
            return result;
        } catch (error) {
            logger.error(`Error running ${algorithm} algorithm: ${error.message}`);
            throw error;
        }
    }

    /**
     * Compare all algorithm results and update optimal route
     * @returns {Object} Object containing all algorithm results
     */
    compareAlgorithms() {
        // Find the best route among all algorithm results
        Object.values(this.algorithmResults).forEach(result => {
            if (result.distance < this.optimalDistance) {
                this.optimalDistance = result.distance;
                this.optimalRoute = [...result.route];
            }
        });
        
        return this.algorithmResults;
    }

    /**
     * Get the distance matrix as a 2D array for display purposes
     * @returns {Array<Array<number|string>>} The distance matrix
     */
    getDistanceMatrixArray() {
        const matrix = [];
        
        // Create header row with city names
        const headerRow = [''];
        this.cities.forEach(city => headerRow.push(city));
        matrix.push(headerRow);
        
        // Create data rows
        this.cities.forEach((city, i) => {
            const row = [city];
            for (let j = 0; j < this.cityCount; j++) {
                row.push(this.distanceMatrix[i][j]);
            }
            matrix.push(row);
        });
        
        return matrix;
    }
}

module.exports = TSPGame;
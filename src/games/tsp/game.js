/**
 * Traveling Salesman Problem Game Logic
 * This file handles the core game logic for the TSP game
 */

const { Timer } = require('../../utils/timer');
const logger = require('../../utils/logger');

class TSPGame {
    constructor() {
        this.cities = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
        this.distanceMatrix = this.generateDistanceMatrix();
        this.homeCity = this.selectRandomHomeCity();
        this.selectedRoute = [this.homeCity]; // Route always starts with home city
        this.algorithmResults = {};
        this.timer = new Timer();
    }

    /**
     * Generate a random distance matrix between cities
     * Distances are between 50-100 km
     * @returns {Map} A matrix of distances between cities
     */
    generateDistanceMatrix() {
        const matrix = new Map();
        
        // Generate random distances between each pair of cities (50-100 km)
        for (let i = 0; i < this.cities.length; i++) {
            const cityA = this.cities[i];
            matrix.set(cityA, new Map());
            
            for (let j = 0; j < this.cities.length; j++) {
                const cityB = this.cities[j];
                
                // Distance from a city to itself is 0
                if (i === j) {
                    matrix.get(cityA).set(cityB, 0);
                    continue;
                }
                
                // If we've already calculated distance from B to A, use the same value
                if (j < i && matrix.get(cityB).has(cityA)) {
                    const distance = matrix.get(cityB).get(cityA);
                    matrix.get(cityA).set(cityB, distance);
                } else {
                    // Generate a random distance between 50 and 100 km
                    const distance = Math.floor(Math.random() * 51) + 50;
                    matrix.get(cityA).set(cityB, distance);
                }
            }
        }
        
        return matrix;
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
     * @throws {Error} If the city is invalid or already in the route
     */
    addCityToRoute(city) {
        // Validate city
        if (!this.cities.includes(city)) {
            throw new Error(`Invalid city: ${city}`);
        }
        
        // Check if city is already in the route (except for home city at the end)
        if (this.selectedRoute.includes(city)) {
            throw new Error(`City ${city} is already in the route`);
        }
        
        // Add city to route
        this.selectedRoute.push(city);
        
        logger.info(`Added ${city} to route: ${this.selectedRoute.join(' -> ')}`);
    }

    /**
     * Get distance between two cities
     * @param {string} cityA - First city
     * @param {string} cityB - Second city
     * @returns {number} The distance in km
     */
    getDistance(cityA, cityB) {
        if (!this.distanceMatrix.has(cityA) || !this.distanceMatrix.get(cityA).has(cityB)) {
            throw new Error(`Invalid cities: ${cityA}, ${cityB}`);
        }
        
        return this.distanceMatrix.get(cityA).get(cityB);
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
        
        // If the tour is complete, add distance back to home city
        if (this.isCompleteTour(route)) {
            // If route doesn't end at home city, add distance back
            if (route[route.length - 1] !== route[0]) {
                totalDistance += this.getDistance(route[route.length - 1], route[0]);
            }
        }
        
        return totalDistance;
    }

    /**
     * Check if a route forms a complete tour
     * @param {Array<string>} [route=this.selectedRoute] - The route to check
     * @returns {boolean} True if all cities are visited
     */
    isCompleteTour(route = this.selectedRoute) {
        return route.length === this.cities.length;
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
        
        logger.info(`${algorithmName} algorithm completed. Distance: ${distance} km, Time: ${executionTime} ms`);
        
        return result;
    }

    /**
     * Compare all algorithm results
     * @returns {Object} Object containing all algorithm results
     */
    compareAlgorithms() {
        return this.algorithmResults;
    }

    /**
     * Get the distance matrix as a 2D array for display purposes
     * @returns {Array<Array<number>>} The distance matrix
     */
    getDistanceMatrixArray() {
        const matrix = [];
        
        // Create header row with city names
        const headerRow = [''];
        this.cities.forEach(city => headerRow.push(city));
        matrix.push(headerRow);
        
        // Create data rows
        this.cities.forEach(cityA => {
            const row = [cityA];
            this.cities.forEach(cityB => {
                row.push(this.getDistance(cityA, cityB));
            });
            matrix.push(row);
        });
        
        return matrix;
    }
}

module.exports = TSPGame;
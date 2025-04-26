import logger from '../../../utils/logger.js';
import { trackAlgorithmPerformance } from '../../../utils/performanceTracker.js';

/**
 * Nearest Neighbor Algorithm for Traveling Salesman Problem
 * 
 * This is a greedy algorithm that:
 * 1. Starts at the home city
 * 2. Repeatedly visits the nearest unvisited city
 * 3. Returns to the home city after visiting all cities
 * 
 * Time Complexity: O(n²) where n is the number of cities
 * Space Complexity: O(n)
 * 
 * @param {Array<Array<number>>} distanceMatrix - Matrix of distances between cities
 * @param {string} homeCity - Home city name
 * @returns {Array<string>} Optimal route starting and ending at the home city
 */
function nearestNeighbor(distanceMatrix, homeCity) {
    // Convert homeCity from name to index if needed
    const startIndex = typeof homeCity === 'string' 
        ? Array.from('ABCDEFGHIJ').indexOf(homeCity)
        : homeCity;
        
    const n = distanceMatrix.length;
    const visited = new Array(n).fill(false);
    const route = [startIndex];
    let totalDistance = 0;
    let currentCity = startIndex;

    // Mark home city as visited
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
    route.push(startIndex); // Complete the circuit
    
    // Convert indices back to city names
    const cityNames = Array.from('ABCDEFGHIJ').slice(0, n);
    const namedRoute = route.map(index => cityNames[index]);
    
    return namedRoute;
}

/**
 * Save performance metrics to database
 * @param {Object} game - Game instance
 * @param {string} algorithm - Algorithm name
 * @param {Object} result - Algorithm result
 * @returns {Promise<void>}
 */
async function savePerformanceMetrics(game, algorithm, result) {
    if (!game.gameId) return;
    
    try {
        await trackAlgorithmPerformance({
            gameId: game.gameId,
            algorithmName: algorithm,
            executionTime: result.executionTime / 1000, // Convert to seconds
            solutionFound: true,
            iterations: result.route.length,
            parameters: {
                cityCount: game.cityCount,
                homeCity: game.homeCity,
                distance: result.distance
            }
        });
        
        logger.info(`Performance metrics saved for ${algorithm} algorithm`);
    } catch (error) {
        logger.error(`Failed to save performance metrics: ${error.message}`);
    }
}

export default nearestNeighbor;
export { savePerformanceMetrics };
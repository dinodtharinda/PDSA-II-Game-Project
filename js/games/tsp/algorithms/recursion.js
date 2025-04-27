/**
 * Recursive (Brute Force) algorithm for TSP
 * Explores all possible permutations to find the optimal path
 * Time Complexity: O(n!)
 * Space Complexity: O(n)
 */

import logger from '../../../utils/logger.js';

/**
 * Solve the TSP using a recursive brute force approach
 * @param {Object} options - TSP options
 * @param {Array<string>} options.cities - Array of city names
 * @param {Array<Array<number>>} options.distances - Distance matrix
 * @param {string} options.homeCity - Home city name
 * @param {number} options.homeIndex - Index of home city in cities array
 * @returns {Object} Solution object with path and distance
 */
export default function recursiveTSP(options) {
  try {
    const { cities, distances, homeCity, homeIndex } = options;
    
    // If only one city or no cities, return empty path
    if (cities.length <= 1) {
      return {
        success: true,
        path: cities,
        distance: 0,
        algorithm: 'recursion'
      };
    }
    
    // Initialize variables
    const n = cities.length;
    let bestDistance = Infinity;
    let bestPath = [];
    
    // Array to track visited cities (homeCity is already visited)
    const visited = Array(n).fill(false);
    visited[homeIndex] = true;
    
    // Current partial path starts with home city
    const path = [homeCity];
    
    // Start recursive search from the home city
    findBestPath(homeIndex, 1, 0);
    
    /**
     * Recursive function to find the best path
     * @param {number} currentIndex - Current city index
     * @param {number} count - Number of cities visited so far
     * @param {number} currentDistance - Current distance traveled
     */
    function findBestPath(currentIndex, count, currentDistance) {
      // If all cities are visited, check if we can return to home
      if (count === n) {
        // Add distance from last city back to home
        const totalDistance = currentDistance + distances[currentIndex][homeIndex];
        
        // If better than current best, update best path
        if (totalDistance < bestDistance) {
          bestDistance = totalDistance;
          bestPath = [...path, homeCity]; // Add home city at the end
        }
        return;
      }
      
      // Try all unvisited cities as next step
      for (let i = 0; i < n; i++) {
        if (!visited[i]) {
          // Mark as visited and add to path
          visited[i] = true;
          path.push(cities[i]);
          
          // Recursively explore this path
          findBestPath(
            i, 
            count + 1, 
            currentDistance + distances[currentIndex][i]
          );
          
          // Backtrack
          visited[i] = false;
          path.pop();
        }
      }
    }
    
    // For small problems (n <= 10), this should be feasible
    // But for larger problems, this could time out
    // Limit the n to avoid hanging the browser
    if (n > 10) {
      return {
        success: false,
        error: "Problem size too large for brute force approach (n > 10)",
        algorithm: 'recursion'
      };
    }
    
    if (bestPath.length === 0) {
      return {
        success: false,
        error: "No valid path found",
        algorithm: 'recursion'
      };
    }
    
    // Return the best solution found
    return {
      success: true,
      path: bestPath,
      distance: bestDistance,
      algorithm: 'recursion'
    };
  } catch (error) {
    logger.error("Recursive TSP algorithm error:", error);
    return {
      success: false,
      error: error.message || "Recursive algorithm failed",
      algorithm: 'recursion'
    };
  }
}
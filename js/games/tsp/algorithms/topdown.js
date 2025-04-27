/**
 * Dynamic Programming (Top-Down/Memoization) algorithm for TSP
 * Uses bitmasks to represent visited cities and memoization to avoid recalculating subproblems
 * Time Complexity: O(n^2 * 2^n)
 * Space Complexity: O(n * 2^n)
 */

import logger from '../../../utils/logger.js';

/**
 * Solve the TSP using a top-down dynamic programming approach
 * @param {Object} options - TSP options
 * @param {Array<string>} options.cities - Array of city names
 * @param {Array<Array<number>>} options.distances - Distance matrix
 * @param {string} options.homeCity - Home city name
 * @param {number} options.homeIndex - Index of home city in cities array
 * @returns {Object} Solution object with path and distance
 */
export default function topDownTSP(options) {
  try {
    const { cities, distances, homeCity, homeIndex } = options;
    
    // If only one city or no cities, return empty path
    if (cities.length <= 1) {
      return {
        success: true,
        path: cities,
        distance: 0,
        algorithm: 'topdown'
      };
    }
    
    const n = cities.length;
    
    // For larger problems, this could use too much memory
    // Limit the n to avoid excessive memory usage
    if (n > 20) {
      return {
        success: false,
        error: "Problem size too large for dynamic programming approach (n > 20)",
        algorithm: 'topdown'
      };
    }
    
    // Memoization table: dp[mask][current] = shortest distance with visited cities in mask, ending at current
    // We need n * 2^n entries
    const dp = new Map();
    
    // Parent pointers to reconstruct the path
    const parent = new Map();
    
    // Calculate the shortest path starting from homeIndex
    // Start with only homeIndex visited (bitmask with only homeIndex bit set)
    const visitedInitial = 1 << homeIndex;
    const optimalDistance = tsp(visitedInitial, homeIndex);
    
    // Reconstruct the path
    const path = reconstructPath();
    
    /**
     * Top-down DP function to find the shortest path
     * @param {number} mask - Bitmask representing visited cities
     * @param {number} pos - Current position (city index)
     * @returns {number} Shortest distance for this subproblem
     */
    function tsp(mask, pos) {
      // If all cities are visited, return distance back to home
      if (mask === (1 << n) - 1) {
        return distances[pos][homeIndex];
      }
      
      // Check if we've already computed this subproblem
      const key = `${mask}|${pos}`;
      if (dp.has(key)) {
        return dp.get(key);
      }
      
      let ans = Infinity;
      let bestNext = -1;
      
      // Try all unvisited cities as next step
      for (let next = 0; next < n; next++) {
        // If the city is not visited yet
        if ((mask & (1 << next)) === 0) {
          const subproblemDistance = distances[pos][next] + tsp(mask | (1 << next), next);
          if (subproblemDistance < ans) {
            ans = subproblemDistance;
            bestNext = next;
          }
        }
      }
      
      // Store the best next city for path reconstruction
      parent.set(key, bestNext);
      
      // Memoize and return
      dp.set(key, ans);
      return ans;
    }
    
    /**
     * Reconstruct the path from parent pointers
     * @returns {Array} The optimal path
     */
    function reconstructPath() {
      let mask = visitedInitial;
      let pos = homeIndex;
      const result = [homeCity];
      
      // Add cities until all are visited
      while (mask !== (1 << n) - 1) {
        const key = `${mask}|${pos}`;
        const next = parent.get(key);
        
        if (next === -1 || next === undefined) break; // No valid path found
        
        result.push(cities[next]);
        mask |= (1 << next);
        pos = next;
      }
      
      // Add home city to complete the circuit
      result.push(homeCity);
      
      return result;
    }
    
    if (path.length < n + 1) {
      return {
        success: false,
        error: "Failed to find a complete path",
        algorithm: 'topdown'
      };
    }
    
    // Return the solution
    return {
      success: true,
      path: path,
      distance: optimalDistance,
      algorithm: 'topdown'
    };
  } catch (error) {
    logger.error("Dynamic programming TSP algorithm error:", error);
    return {
      success: false,
      error: error.message || "Dynamic programming algorithm failed",
      algorithm: 'topdown'
    };
  }
}
/**
 * Nearest Neighbor algorithm for TSP
 * A greedy approach that always visits the closest unvisited city next
 * Time Complexity: O(n^2)
 * Space Complexity: O(n)
 */

import logger from '../../../utils/logger.js';

/**
 * Solve the TSP using the nearest neighbor approach
 * @param {Object} options - TSP options
 * @param {Array<string>} options.cities - Array of city names
 * @param {Array<Array<number>>} options.distances - Distance matrix
 * @param {string} options.homeCity - Home city name
 * @param {number} options.homeIndex - Index of home city in cities array
 * @returns {Object} Solution object with path and distance
 */
export default function nearestNeighbor(options) {
  try {
    const { cities, distances, homeCity, homeIndex } = options;
    
    // If only one city or no cities, return empty path
    if (cities.length <= 1) {
      return {
        success: true,
        path: cities,
        distance: 0,
        algorithm: 'nearest'
      };
    }
    
    const n = cities.length;
    
    // Track visited cities
    const visited = Array(n).fill(false);
    visited[homeIndex] = true;
    
    // Start path with home city
    const path = [homeCity];
    let currentCity = homeIndex;
    let totalDistance = 0;
    let citiesVisited = 1;
    
    // Visit all remaining cities
    while (citiesVisited < n) {
      let nearestDist = Infinity;
      let nearestCity = -1;
      
      // Find the nearest unvisited city
      for (let city = 0; city < n; city++) {
        if (!visited[city] && distances[currentCity][city] < nearestDist) {
          nearestDist = distances[currentCity][city];
          nearestCity = city;
        }
      }
      
      // If we found a valid next city
      if (nearestCity !== -1) {
        // Add distance to nearest city
        totalDistance += nearestDist;
        
        // Move to the nearest city
        currentCity = nearestCity;
        visited[currentCity] = true;
        path.push(cities[currentCity]);
        citiesVisited++;
      } else {
        // No unvisited cities left (shouldn't happen in a complete graph)
        break;
      }
    }
    
    // Return to home city to complete the tour
    totalDistance += distances[currentCity][homeIndex];
    path.push(homeCity);
    
    return {
      success: true,
      path: path,
      distance: totalDistance,
      algorithm: 'nearest'
    };
  } catch (error) {
    logger.error("Nearest neighbor algorithm error:", error);
    return {
      success: false,
      error: error.message || "Nearest neighbor algorithm failed",
      algorithm: 'nearest'
    };
  }
}
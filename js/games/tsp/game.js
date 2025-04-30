/**
 * Traveling Salesman Problem Game
 * Core game logic for the TSP game
 */

import apiService from './services/api.js';
import BaseGame from '../BaseGame.js';
import Timer from '../../utils/timer.js';
import logger from '../../utils/logger.js';

// Import algorithm modules
import nearestNeighborAlgorithm from './algorithms/nearest.js';
import topDownAlgorithm from './algorithms/topdown.js';
import recursiveAlgorithm from './algorithms/recursion.js';

logger.debug("API Service imported:", apiService);
logger.debug("Base Game imported:", BaseGame);
logger.debug("Algorithms imported:", {
  nearestNeighborAlgorithm,
  topDownAlgorithm,
  recursiveAlgorithm
});

// City names (A to J)
const CITY_NAMES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

/**
 * TSP Game class
 * Manages the game state and logic for the Traveling Salesman Problem
 */
export default class TSPGame extends BaseGame {
  /**
   * Constructor
   * @param {Object} options - Game options
   */
  constructor(options = {}) {
    super('tsp');
    
    // Game configuration
    this.options = {
      playerName: options.playerName || 'Player',
      cityCount: options.cityCount || 10,
      minDistance: options.minDistance || 50,
      maxDistance: options.maxDistance || 100,
      ...options
    };
    
    // Game state
    this.cities = [];
    this.distances = [];
    this.homeCity = null;
    this.selectedCities = [];
    this.userPath = [];
    this.algorithmResults = {};
    this.gameId = null;
    
    // Initialize board
    this.initialized = false;
  }
  
  /**
   * Initialize the game
   * @returns {Promise<Object>} Game data
   */
  async initialize() {
    try {
      this.cities = CITY_NAMES.slice(0, this.options.cityCount);
      this.distances = this._generateDistances();
      this.homeCity = this._selectRandomHomeCity();
      this.selectedCities = [...this.cities]; // By default, all cities are selected
      this.userPath = [this.homeCity]; // Start with home city
      
      // Create game record in the database
      const result = await apiService.createTSPGame({
        cities: this.cities,
        distances: this.distances,
        homeCity: this.homeCity,
        playerName: this.options.playerName
      });
      
      if (result.success) {
        this.gameId = result.gameId;
        logger.info(`TSP game created with ID: ${this.gameId}`);
      } else {
        logger.error('Failed to create TSP game record:', result.error);
      }
      
      this.initialized = true;
      return this.getGameState();
    } catch (error) {
      logger.error('Error initializing TSP game:', error);
      throw error;
    }
  }
  
  /**
   * Generate random distances between cities
   * @returns {Array<Array<number>>} 2D array of distances
   */
  _generateDistances() {
    const n = this.cities.length;
    const distances = Array(n).fill().map(() => Array(n).fill(0));
    
    // Fill the distance matrix with random values between min and max
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const distance = Math.floor(
          Math.random() * (this.options.maxDistance - this.options.minDistance + 1) + 
          this.options.minDistance
        );
        distances[i][j] = distance;
        distances[j][i] = distance; // Symmetric distances
      }
    }
    
    return distances;
  }
  
  /**
   * Select a random home city
   * @returns {string} Home city name
   */
  _selectRandomHomeCity() {
    const randomIndex = Math.floor(Math.random() * this.cities.length);
    return this.cities[randomIndex];
  }
  
  /**
   * Select cities to visit
   * @param {Array<string>} cities - Array of city names
   */
  selectCities(cities) {
    if (!Array.isArray(cities) || cities.length === 0) {
      throw new Error('Invalid cities selection');
    }
    
    // Validate city names
    const invalidCities = cities.filter(city => !this.cities.includes(city));
    if (invalidCities.length > 0) {
      throw new Error(`Invalid city names: ${invalidCities.join(', ')}`);
    }
    
    // Make sure home city is included
    if (!cities.includes(this.homeCity)) {
      cities.push(this.homeCity);
    }
    
    this.selectedCities = cities;
    this.userPath = [this.homeCity]; // Reset path to start with home city
    
    return this.selectedCities;
  }
  
  /**
   * Add a city to the user's path
   * @param {string} city - City name
   * @returns {Object} Updated game state
   */
  addToPath(city) {
    if (!this.selectedCities.includes(city)) {
      throw new Error(`City ${city} is not in the selected cities`);
    }
    
    if (this.userPath.includes(city) && city !== this.homeCity) {
      throw new Error(`City ${city} is already in the path`);
    }
    
    // If adding home city as the last city to complete the tour
    if (city === this.homeCity && this.userPath.length > 1) {
      if (this.userPath.length < this.selectedCities.length) {
        throw new Error('Cannot return to home city before visiting all selected cities');
      }
    }
    
    this.userPath.push(city);
    return this.getGameState();
  }
  
  /**
   * Remove the last city from the user's path
   * @returns {Object} Updated game state
   */
  removeLastCity() {
    if (this.userPath.length <= 1) {
      throw new Error('Cannot remove home city from the beginning of the path');
    }
    
    this.userPath.pop();
    return this.getGameState();
  }
  
  /**
   * Reset the user's path to start with home city
   * @returns {Object} Updated game state
   */
  resetPath() {
    this.userPath = [this.homeCity];
    return this.getGameState();
  }
  
  /**
   * Calculate the total distance of a path
   * @param {Array<string>} path - Array of city names
   * @returns {number} Total distance
   */
  calculateDistance(path) {
    if (!path || path.length < 2) {
      return 0;
    }
    
    let totalDistance = 0;
    
    for (let i = 0; i < path.length - 1; i++) {
      const fromCityIndex = this.cities.indexOf(path[i]);
      const toCityIndex = this.cities.indexOf(path[i + 1]);
      
      if (fromCityIndex === -1 || toCityIndex === -1) {
        throw new Error(`Invalid city in path: ${path[i]} or ${path[i + 1]}`);
      }
      
      totalDistance += this.distances[fromCityIndex][toCityIndex];
    }
    
    return totalDistance;
  }
  
  /**
   * Check if the user's path is a valid solution
   * @returns {Object} Validation result
   */
  validateUserSolution() {
    // Check if all cities are visited
    const visitedCities = new Set(this.userPath);
    
    // Remove home city from count if it appears twice (at start and end)
    if (this.userPath[0] === this.homeCity && 
        this.userPath[this.userPath.length - 1] === this.homeCity) {
      visitedCities.delete(this.homeCity);
    }
    
    // Check if all cities are visited
    if (visitedCities.size < this.cities.length) {
      return {
        valid: false,
        reason: 'notAllCitiesVisited',
        message: 'Not all cities are visited in the path'
      };
    }
    
    // Check if path starts at home city
    if (this.userPath[0] !== this.homeCity) {
      return {
        valid: false,
        reason: 'doesNotStartAtHome',
        message: `Path must start at home city: ${this.homeCity}`
      };
    }
    
    // Check if path ends at home city
    if (this.userPath[this.userPath.length - 1] !== this.homeCity) {
      return {
        valid: false,
        reason: 'doesNotEndAtHome',
        message: `Path must end at home city: ${this.homeCity}`
      };
    }
    
    // Check for duplicated cities (each city should be visited exactly once, except home city)
    const cityCounts = {};
    for (const city of this.userPath) {
      cityCounts[city] = (cityCounts[city] || 0) + 1;
    }
    
    // Home city can appear twice (start and end)
    cityCounts[this.homeCity]--;
    
    // All other cities must appear exactly once
    for (const city in cityCounts) {
      if (cityCounts[city] !== 1) {
        return {
          valid: false,
          reason: 'duplicatedCities',
          message: `Each city must be visited exactly once, but ${city} is visited ${cityCounts[city]} times`
        };
      }
    }
    
    // Valid solution
    const totalDistance = this.calculateDistance(this.userPath);
    return {
      valid: true,
      totalDistance,
      message: `Valid solution with total distance: ${totalDistance}`
    };
  }
  
  /**
   * Solve the TSP using a specified algorithm
   * @param {string} algorithmName - Algorithm name
   * @returns {Promise<Object>} Algorithm result
   */
  async solve(algorithmName) {
    try {
      logger.info(`Solving TSP using ${algorithmName} algorithm`);
      
      // Create a subgraph with only the selected cities
      const subgraph = this._createSubgraph();
      
      try {
        // Prepare common options for all algorithms
        const homeIndex = this.selectedCities.indexOf(this.homeCity);
        const options = {
          cities: this.selectedCities,
          distances: subgraph,
          homeCity: this.homeCity,
          homeIndex: homeIndex
        };
        
        // Start timing
        const startTime = performance.now();
        
        // Track whether a solution was found
        let solutionFound = false;
        let result;
        
        // Execute the appropriate algorithm from imported modules
        switch (algorithmName) {
          case 'nearest':
            result = nearestNeighborAlgorithm(options);
            solutionFound = result.success;
            break;
          
          case 'topdown':
            result = topDownAlgorithm(options);
            solutionFound = result.success;
            break;
          
          case 'recursion':
            result = recursiveAlgorithm(options);
            solutionFound = result.success;
            break;
          
          default:
            throw new Error(`Unknown algorithm: ${algorithmName}`);
        }
        
        // Calculate execution time
        const endTime = performance.now();
        const executionTime = endTime - startTime;
        
        // Add execution time to the result
        const finalResult = {
          ...result,
          executionTime,
          algorithmName
        };
        
        // Store result in game state even if database save fails
        this.algorithmResults[algorithmName] = finalResult;
        
        logger.info(`${algorithmName} executed successfully with distance ${finalResult.distance}`);
        
        // Try to save to database, but don't let failures prevent returning the result
        try {
          if (this.gameId && typeof apiService !== 'undefined') {
            await apiService.saveTSPPerformance(
              this.gameId,
              algorithmName,
              executionTime,
              finalResult,
              solutionFound
            );
            logger.info(`${algorithmName} performance saved to database`);
          }
        } catch (dbError) {
          // Log database error but continue - don't fail the operation
          logger.error(`Failed to save ${algorithmName} performance to database:`, dbError);
        }
        
        // Return the successful result regardless of database save
        return finalResult;
        
      } catch (algorithmError) {
        logger.error(`Failed to execute algorithm ${algorithmName}:`, algorithmError);
        return {
          algorithmName,
          success: false,
          error: `Algorithm execution error: ${algorithmError.message}`,
          path: [],
          distance: 0
        };
      }
    } catch (error) {
      logger.error(`Error in solve() method for ${algorithmName}:`, error);
      return {
        algorithmName,
        success: false,
        error: error.message,
        path: [],
        distance: 0
      };
    }
  }
  
  /**
   * Create a subgraph with only the selected cities
   * @returns {Array<Array<number>>} Subgraph distance matrix
   */
  _createSubgraph() {
    const n = this.selectedCities.length;
    const subgraph = Array(n).fill().map(() => Array(n).fill(0));
    
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const cityIndex1 = this.cities.indexOf(this.selectedCities[i]);
        const cityIndex2 = this.cities.indexOf(this.selectedCities[j]);
        
        subgraph[i][j] = this.distances[cityIndex1][cityIndex2];
      }
    }
    
    return subgraph;
  }
  
  /**
   * Compare algorithm results
   * @returns {Object} Comparison results
   */
  compareAlgorithms() {
    const algorithms = Object.keys(this.algorithmResults);
    if (algorithms.length === 0) {
      return { message: 'No algorithms have been run yet' };
    }
    
    const comparison = algorithms.map(name => {
      const result = this.algorithmResults[name];
      return {
        name,
        distance: result.distance,
        executionTime: result.executionTime,
        path: result.path
      };
    });
    
    // Sort by distance (ascending)
    comparison.sort((a, b) => a.distance - b.distance);
    
    return {
      bestAlgorithm: comparison[0].name,
      shortestDistance: comparison[0].distance,
      shortestPath: comparison[0].path,
      comparison
    };
  }
  
  /**
   * End the game and save results to database
   * @param {string} status - Game status ('completed', 'abandoned')
   * @returns {Promise<Object>} Result
   */
  async endGame(status = 'completed') {
    if (!this.gameId) {
      logger.warn('Cannot end game: No game ID');
      return { success: false, message: 'No active game to end' };
    }
    
    try {
      const userSolution = this.validateUserSolution();
      
      const finalState = {
        path: this.userPath,
        totalDistance: userSolution.valid ? userSolution.distance : 0,
        isValid: userSolution.valid
      };
      
      const result = await apiService.endTSPGame(this.gameId, status, finalState);
      
      if (result.success) {
        this.gameId = null; // Clear game ID to prevent double-ending
      }
      
      return result;
    } catch (error) {
      logger.error('Error ending TSP game:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Get the current game state
   * @returns {Object} Game state
   */
  getGameState() {
    const userDistance = this.calculateDistance(this.userPath);
    const tourCompleted = this.userPath.length > 1 && 
                          this.userPath[0] === this.homeCity && 
                          this.userPath[this.userPath.length - 1] === this.homeCity;
    
    const visitedCities = new Set(this.userPath);
    const allVisited = this.selectedCities.every(city => visitedCities.has(city));
    
    return {
      cities: this.cities,
      distances: this.distances,
      homeCity: this.homeCity,
      selectedCities: this.selectedCities,
      userPath: this.userPath,
      userDistance,
      tourCompleted: tourCompleted && allVisited,
      remainingCities: this.selectedCities.filter(city => 
        !this.userPath.includes(city) || (city === this.homeCity && !tourCompleted)
      ),
      algorithmResults: this.algorithmResults
    };
  }
  
  /**
   * Reset the game with new random distances and home city
   * @returns {Promise<Object>} Updated game state
   */
  async resetGame() {
    // End current game if exists
    if (this.gameId) {
      await this.endGame('abandoned');
    }
    
    // Generate new game
    this.distances = this._generateDistances();
    this.homeCity = this._selectRandomHomeCity();
    this.userPath = [this.homeCity];
    this.algorithmResults = {};
    
    // Create new game record
    const result = await apiService.createTSPGame({
      cities: this.cities,
      distances: this.distances,
      homeCity: this.homeCity,
      playerName: this.options.playerName
    });
    
    if (result.success) {
      this.gameId = result.gameId;
    }
    
    return this.getGameState();
  }
}
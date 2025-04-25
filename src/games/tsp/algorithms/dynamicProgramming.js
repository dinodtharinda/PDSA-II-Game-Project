/**
 * Dynamic Programming Algorithm for Traveling Salesman Problem (Held-Karp algorithm)
 * 
 * This exact algorithm uses a recursive approach with memoization:
 * 1. Uses bitmasks to represent sets of visited cities
 * 2. Recursively computes optimal solutions for each subset of cities
 * 3. Returns the optimal tour
 * 
 * Time Complexity: O(n²·2ⁿ) where n is the number of cities
 * Space Complexity: O(n·2ⁿ)
 * 
 * @param {Array<Array<number>>} distanceMatrix - Matrix of distances between cities
 * @param {Array<string>} cities - Array of city names
 * @param {number} startIndex - Index of the home city
 * @returns {Object} Object containing the route and total distance
 */
function dynamicProgramming(distanceMatrix, cities, startIndex) {
    const n = distanceMatrix.length;
    
    // For small instances (n <= 3), use brute force since it's simpler
    if (n <= 3) {
        return bruteForce(distanceMatrix, startIndex);
    }
    
    // Memoization storage
    const dp = {}; // Store cost
    const path = {}; // Store next city in path
    
    // Calculate minimum cost using recursive DP
    const cost = solve(1 << startIndex, startIndex);
    
    // Reconstruct path
    const route = reconstructPath(1 << startIndex, startIndex);
    
    return {
        route: route,
        distance: cost
    };
    
    /**
     * Recursive DP function to solve TSP
     * @param {number} mask - Bitmask representing visited cities
     * @param {number} pos - Current city index
     * @returns {number} Minimum cost from current state
     */
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
        
        // Store the best next city
        path[key] = bestNext;
        
        // Memoize and return
        return dp[key] = ans;
    }
    
    /**
     * Reconstruct the optimal path from memoization
     * @param {number} mask - Bitmask representing visited cities
     * @param {number} pos - Current city index
     * @returns {Array<number>} Optimal route
     */
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
            
            // Break if all cities visited to avoid infinite loop
            if (currentMask === (1 << n) - 1) {
                break;
            }
        }
        
        return result;
    }
}

/**
 * Brute force approach for very small TSP instances
 * @param {Array<Array<number>>} distanceMatrix - Matrix of distances between cities
 * @param {number} startIndex - Index of the home city
 * @returns {Object} Object containing the route and total distance
 */
function bruteForce(distanceMatrix, startIndex) {
    const n = distanceMatrix.length;
    const cities = Array.from({length: n}, (_, i) => i);
    
    // Create all permutations of cities (excluding start)
    const otherCities = cities.filter(c => c !== startIndex);
    const permutations = getPermutations(otherCities);
    
    let minDistance = Infinity;
    let bestRoute = [];
    
    // Evaluate all permutations
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
 * @param {Array} arr - Array to permute
 * @returns {Array<Array>} All permutations
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

module.exports = dynamicProgramming;
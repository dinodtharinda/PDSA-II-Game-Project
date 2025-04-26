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
 * @param {Array<string>} cities - Array of city names
 * @param {number} startIndex - Index of the home city
 * @returns {Object} Object containing the route and total distance
 */
function nearestNeighbor(distanceMatrix, cities, startIndex) {
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
    
    return {
        route: route,
        distance: totalDistance
    };
}

export default nearestNeighbor;
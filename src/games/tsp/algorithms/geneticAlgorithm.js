/**
 * Genetic Algorithm for Traveling Salesman Problem
 * 
 * This heuristic algorithm mimics natural selection:
 * 1. Creates a population of random tours
 * 2. Evolves the population through selection, crossover, and mutation
 * 3. Returns the best tour found
 * 
 * Time Complexity: O(g * p * n²) where:
 *   g = number of generations
 *   p = population size
 *   n = number of cities
 * 
 * @param {Array<Array<number>>} distanceMatrix - Matrix of distances between cities
 * @param {Array<string>} cities - Array of city names
 * @param {number} startIndex - Index of the home city
 * @returns {Object} Object containing the route and total distance
 */
function geneticAlgorithm(distanceMatrix, cities, startIndex) {
    const n = distanceMatrix.length;
    
    // Configure parameters based on problem size
    const populationSize = n <= 10 ? 50 : 100;
    const generations = n <= 10 ? 100 : 200;
    const mutationRate = n <= 10 ? 0.2 : 0.1;
    const elitismRate = n <= 10 ? 0.1 : 0.2;
    
    // Initialize population
    let population = initializePopulation(n, startIndex, populationSize);
    
    // Evaluate initial population
    let fitnessScores = population.map(individual => 
        calculateFitness(individual, distanceMatrix, startIndex)
    );
    
    // Track best solution
    let bestIndividual = [...population[0]];
    let bestFitness = fitnessScores[0];
    
    for (let i = 0; i < fitnessScores.length; i++) {
        if (fitnessScores[i] < bestFitness) {
            bestFitness = fitnessScores[i];
            bestIndividual = [...population[i]];
        }
    }
    
    // Evolution loop - improve over generations
    for (let generation = 0; generation < generations; generation++) {
        // Create new generation through evolution
        const newPopulation = evolvePopulation(
            population, 
            fitnessScores, 
            populationSize, 
            elitismRate,
            mutationRate, 
            startIndex
        );
        
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
 * @param {number} n - Number of cities
 * @param {number} startIndex - Index of the home city
 * @param {number} populationSize - Size of the population
 * @returns {Array<Array<number>>} Initial population
 */
function initializePopulation(n, startIndex, populationSize) {
    const population = [];
    
    for (let i = 0; i < populationSize; i++) {
        // Each tour starts with the home city
        const tour = [startIndex];
        
        // Add remaining cities in random order
        const remainingCities = [];
        for (let j = 0; j < n; j++) {
            if (j !== startIndex) {
                remainingCities.push(j);
            }
        }
        
        // Shuffle remaining cities (Fisher-Yates algorithm)
        for (let j = remainingCities.length - 1; j > 0; j--) {
            const randomIndex = Math.floor(Math.random() * (j + 1));
            [remainingCities[j], remainingCities[randomIndex]] = 
            [remainingCities[randomIndex], remainingCities[j]];
        }
        
        // Add shuffled cities to tour
        tour.push(...remainingCities);
        population.push(tour);
    }
    
    return population;
}

/**
 * Calculate fitness (route length) for genetic algorithm
 * @param {Array<number>} individual - A route/tour
 * @param {Array<Array<number>>} distanceMatrix - Matrix of distances between cities
 * @param {number} startIndex - Index of the home city
 * @returns {number} Total distance of the tour
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
 * Evolve population through selection, crossover, and mutation
 * @param {Array<Array<number>>} population - Current population
 * @param {Array<number>} fitnessScores - Fitness scores for each individual
 * @param {number} populationSize - Size of the population
 * @param {number} elitismRate - Percentage of elite individuals to keep
 * @param {number} mutationRate - Probability of mutation
 * @param {number} startIndex - Index of the home city
 * @returns {Array<Array<number>>} New evolved population
 */
function evolvePopulation(population, fitnessScores, populationSize, elitismRate, mutationRate, startIndex) {
    const newPopulation = [];
    
    // Elitism: Keep the best individuals
    const eliteCount = Math.max(1, Math.floor(populationSize * elitismRate));
    const sortedIndices = getSortedIndices(fitnessScores);
    
    // Add elite individuals to new population
    for (let i = 0; i < eliteCount; i++) {
        newPopulation.push([...population[sortedIndices[i]]]);
    }
    
    // Generate rest of population through selection and crossover
    while (newPopulation.length < populationSize) {
        // Select parents using tournament selection
        const parent1Index = tournamentSelection(fitnessScores, 3);
        const parent2Index = tournamentSelection(fitnessScores, 3);
        
        // Create child through crossover
        const child = crossover(
            population[parent1Index], 
            population[parent2Index],
            startIndex
        );
        
        // Mutation with some probability
        if (Math.random() < mutationRate) {
            mutate(child, startIndex);
        }
        
        newPopulation.push(child);
    }
    
    return newPopulation;
}

/**
 * Tournament selection for genetic algorithm
 * @param {Array<number>} fitnessScores - Fitness scores for each individual
 * @param {number} tournamentSize - Number of individuals in each tournament
 * @returns {number} Index of selected individual
 */
function tournamentSelection(fitnessScores, tournamentSize) {
    const population = fitnessScores.length;
    let bestIndex = Math.floor(Math.random() * population);
    let bestFitness = fitnessScores[bestIndex];
    
    // Compete random individuals, select the best
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
 * @param {Array<number>} parent1 - First parent route
 * @param {Array<number>} parent2 - Second parent route
 * @param {number} startIndex - Index of the home city
 * @returns {Array<number>} Child route
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
 * @param {Array<number>} individual - Route to mutate
 * @param {number} startIndex - Index of the home city
 * @returns {Array<number>} Mutated route
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
 * Helper function to get indices sorted by fitness (ascending)
 * @param {Array<number>} fitnessScores - Fitness scores for each individual
 * @returns {Array<number>} Indices sorted by fitness
 */
function getSortedIndices(fitnessScores) {
    return Array.from({ length: fitnessScores.length }, (_, i) => i)
        .sort((a, b) => fitnessScores[a] - fitnessScores[b]);
}

module.exports = geneticAlgorithm;
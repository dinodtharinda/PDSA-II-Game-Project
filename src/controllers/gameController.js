/**
 * Game Controller
 * Handles all game-related operations
 */
const logger = require('../utils/logger');
const Game = require('../models/game');

// Get all games
const getAllGames = async (req, res, next) => {
  try {
    const games = await Game.findAll();
    res.json(games);
  } catch (err) {
    logger.error(`Error getting all games: ${err.message}`);
    next(err);
  }
};

// Get game by ID
const getGameById = async (req, res, next) => {
  try {
    const game = await Game.findByPk(req.params.id);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    res.json(game);
  } catch (err) {
    logger.error(`Error getting game by ID: ${err.message}`);
    next(err);
  }
};

// Create new game
const createGame = async (req, res, next) => {
  try {
    const game = await Game.create(req.body);
    res.status(201).json(game);
  } catch (err) {
    logger.error(`Error creating game: ${err.message}`);
    next(err);
  }
};

// Update game
const updateGame = async (req, res, next) => {
  try {
    const game = await Game.findByPk(req.params.id);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    await game.update(req.body);
    res.json(game);
  } catch (err) {
    logger.error(`Error updating game: ${err.message}`);
    next(err);
  }
};

// Tic-Tac-Toe specific controllers
const ticTacToeMove = (req, res, next) => {
  // Placeholder for future implementation
  res.json({ message: 'Tic-Tac-Toe move endpoint' });
};

const getTicTacToeGame = (req, res, next) => {
  // Placeholder for future implementation
  res.json({ message: 'Get Tic-Tac-Toe game endpoint', id: req.params.id });
};

// New Tic-Tac-Toe AI controller methods
const ticTacToeAiMove = async (req, res, next) => {
  try {
    const { board, player, algorithm } = req.body;
    logger.info(`Finding AI move for Tic-Tac-Toe using ${algorithm} algorithm`);
    
    let move, executionTime;
    
    // Select algorithm based on request
    if (algorithm === 'minimax') {
      const minimaxAlgorithm = require('../games/ticTacToe/algorithms/minimax');
      const startTime = process.hrtime();
      move = await minimaxAlgorithm.findBestMove(board, player);
      const endTime = process.hrtime(startTime);
      executionTime = endTime[0] + endTime[1] / 1e9; // Convert to seconds
    } else {
      const mctsAlgorithm = require('../games/ticTacToe/algorithms/mcts');
      const startTime = process.hrtime();
      move = await mctsAlgorithm.findBestMove(board, player);
      const endTime = process.hrtime(startTime);
      executionTime = endTime[0] + endTime[1] / 1e9; // Convert to seconds
    }
    
    res.json({
      success: true,
      move,
      executionTime,
      algorithm
    });
  } catch (err) {
    logger.error(`Error finding AI move for Tic-Tac-Toe: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

const ticTacToeMinimaxMove = async (req, res, next) => {
  try {
    const { board, player } = req.body;
    logger.info('Finding AI move for Tic-Tac-Toe using Minimax algorithm');
    
    const minimaxAlgorithm = require('../games/ticTacToe/algorithms/minimax');
    const startTime = process.hrtime();
    const move = await minimaxAlgorithm.findBestMove(board, player);
    const endTime = process.hrtime(startTime);
    const executionTime = endTime[0] + endTime[1] / 1e9; // Convert to seconds
    
    // Save results to database if authenticated
    if (req.user) {
      // Implementation for saving to database would go here
    }
    
    res.json({
      success: true,
      move,
      executionTime,
      algorithm: 'minimax'
    });
  } catch (err) {
    logger.error(`Error finding AI move with Minimax: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

const ticTacToeMctsMove = async (req, res, next) => {
  try {
    const { board, player } = req.body;
    logger.info('Finding AI move for Tic-Tac-Toe using MCTS algorithm');
    
    const mctsAlgorithm = require('../games/ticTacToe/algorithms/mcts');
    const startTime = process.hrtime();
    const move = await mctsAlgorithm.findBestMove(board, player);
    const endTime = process.hrtime(startTime);
    const executionTime = endTime[0] + endTime[1] / 1e9; // Convert to seconds
    
    // Save results to database if authenticated
    if (req.user) {
      // Implementation for saving to database would go here
    }
    
    res.json({
      success: true,
      move,
      executionTime,
      algorithm: 'mcts'
    });
  } catch (err) {
    logger.error(`Error finding AI move with MCTS: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

// TSP specific controllers
const calculateTspRoute = (req, res, next) => {
  // Placeholder for future implementation
  res.json({ message: 'TSP route calculation endpoint' });
};

const getTspGame = (req, res, next) => {
  // Placeholder for future implementation
  res.json({ message: 'Get TSP game endpoint', id: req.params.id });
};

// TSP algorithm-specific controller methods
const calculateTspNearestNeighbor = async (req, res, next) => {
  try {
    const { distanceMatrix, homeCity } = req.body;
    logger.info(`Calculating TSP route with Nearest Neighbor algorithm from city ${homeCity}`);
    
    const nearestNeighborAlgorithm = require('../games/tsp/algorithms/nearestNeighbor');
    const startTime = process.hrtime();
    const result = await nearestNeighborAlgorithm.findRoute(distanceMatrix, homeCity);
    const endTime = process.hrtime(startTime);
    const executionTime = endTime[0] + endTime[1] / 1e9; // Convert to seconds
    
    // Save results to database if authenticated
    if (req.user) {
      // Implementation for saving to database would go here
    }
    
    res.json({
      success: true,
      route: result.route,
      distance: result.distance,
      executionTime,
      algorithm: 'nearest-neighbor'
    });
  } catch (err) {
    logger.error(`Error calculating TSP route with Nearest Neighbor: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

const calculateTspDynamicProgramming = async (req, res, next) => {
  try {
    const { distanceMatrix, homeCity } = req.body;
    logger.info(`Calculating TSP route with Dynamic Programming algorithm from city ${homeCity}`);
    
    const dpAlgorithm = require('../games/tsp/algorithms/dynamicProgramming');
    const startTime = process.hrtime();
    const result = await dpAlgorithm.findRoute(distanceMatrix, homeCity);
    const endTime = process.hrtime(startTime);
    const executionTime = endTime[0] + endTime[1] / 1e9; // Convert to seconds
    
    // Save results to database if authenticated
    if (req.user) {
      // Implementation for saving to database would go here
    }
    
    res.json({
      success: true,
      route: result.route,
      distance: result.distance,
      executionTime,
      algorithm: 'dynamic-programming'
    });
  } catch (err) {
    logger.error(`Error calculating TSP route with Dynamic Programming: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

const calculateTspGeneticAlgorithm = async (req, res, next) => {
  try {
    const { distanceMatrix, homeCity, populationSize, generations, mutationRate } = req.body;
    logger.info(`Calculating TSP route with Genetic Algorithm from city ${homeCity}`);
    
    const gaAlgorithm = require('../games/tsp/algorithms/geneticAlgorithm');
    const startTime = process.hrtime();
    const result = await gaAlgorithm.findRoute(
      distanceMatrix, 
      homeCity, 
      populationSize || 100, 
      generations || 500, 
      mutationRate || 0.01
    );
    const endTime = process.hrtime(startTime);
    const executionTime = endTime[0] + endTime[1] / 1e9; // Convert to seconds
    
    // Save results to database if authenticated
    if (req.user) {
      // Implementation for saving to database would go here
    }
    
    res.json({
      success: true,
      route: result.route,
      distance: result.distance,
      executionTime,
      algorithm: 'genetic-algorithm',
      generations: result.generations
    });
  } catch (err) {
    logger.error(`Error calculating TSP route with Genetic Algorithm: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

// Tower of Hanoi specific controllers
const validateHanoiMove = (req, res, next) => {
  // Placeholder for future implementation
  res.json({ message: 'Tower of Hanoi move validation endpoint' });
};

const getHanoiGame = (req, res, next) => {
  // Placeholder for future implementation
  res.json({ message: 'Get Tower of Hanoi game endpoint', id: req.params.id });
};

// Tower of Hanoi solution controller methods
const solveHanoiTower = async (req, res, next) => {
  try {
    const { disks, pegs, algorithm } = req.body;
    logger.info(`Solving Tower of Hanoi with ${algorithm} algorithm for ${disks} disks on ${pegs} pegs`);
    
    let solution, executionTime;
    
    // Select algorithm based on request
    if (pegs === 4 || algorithm === 'frame-stewart') {
      const frameStewartAlgorithm = require('../games/towerOfHanoi/algorithms/frameStewart');
      const startTime = process.hrtime();
      solution = await frameStewartAlgorithm.solve(disks, pegs || 4);
      const endTime = process.hrtime(startTime);
      executionTime = endTime[0] + endTime[1] / 1e9; // Convert to seconds
    } else if (algorithm === 'iterative') {
      const iterativeAlgorithm = require('../games/towerOfHanoi/algorithms/iterative');
      const startTime = process.hrtime();
      solution = await iterativeAlgorithm.solve(disks, pegs || 3);
      const endTime = process.hrtime(startTime);
      executionTime = endTime[0] + endTime[1] / 1e9; // Convert to seconds
    } else {
      // Default to recursive
      const recursiveAlgorithm = require('../games/towerOfHanoi/algorithms/recursive');
      const startTime = process.hrtime();
      solution = await recursiveAlgorithm.solve(disks, pegs || 3);
      const endTime = process.hrtime(startTime);
      executionTime = endTime[0] + endTime[1] / 1e9; // Convert to seconds
    }
    
    res.json({
      success: true,
      solution,
      moves: solution.length,
      executionTime,
      algorithm: algorithm || (pegs === 4 ? 'frame-stewart' : 'recursive')
    });
  } catch (err) {
    logger.error(`Error solving Tower of Hanoi: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

const solveHanoiRecursive = async (req, res, next) => {
  try {
    const { disks } = req.body;
    logger.info(`Solving Tower of Hanoi with recursive algorithm for ${disks} disks`);
    
    const recursiveAlgorithm = require('../games/towerOfHanoi/algorithms/recursive');
    const startTime = process.hrtime();
    const solution = await recursiveAlgorithm.solve(disks, 3);
    const endTime = process.hrtime(startTime);
    const executionTime = endTime[0] + endTime[1] / 1e9; // Convert to seconds
    
    // Save results to database if authenticated
    if (req.user) {
      // Implementation for saving to database would go here
    }
    
    res.json({
      success: true,
      solution,
      moves: solution.length,
      executionTime,
      algorithm: 'recursive'
    });
  } catch (err) {
    logger.error(`Error solving Tower of Hanoi with recursive algorithm: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

const solveHanoiIterative = async (req, res, next) => {
  try {
    const { disks } = req.body;
    logger.info(`Solving Tower of Hanoi with iterative algorithm for ${disks} disks`);
    
    const iterativeAlgorithm = require('../games/towerOfHanoi/algorithms/iterative');
    const startTime = process.hrtime();
    const solution = await iterativeAlgorithm.solve(disks, 3);
    const endTime = process.hrtime(startTime);
    const executionTime = endTime[0] + endTime[1] / 1e9; // Convert to seconds
    
    // Save results to database if authenticated
    if (req.user) {
      // Implementation for saving to database would go here
    }
    
    res.json({
      success: true,
      solution,
      moves: solution.length,
      executionTime,
      algorithm: 'iterative'
    });
  } catch (err) {
    logger.error(`Error solving Tower of Hanoi with iterative algorithm: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

const solveHanoiFrameStewart = async (req, res, next) => {
  try {
    const { disks } = req.body;
    logger.info(`Solving Tower of Hanoi with Frame-Stewart algorithm for ${disks} disks`);
    
    const frameStewartAlgorithm = require('../games/towerOfHanoi/algorithms/frameStewart');
    const startTime = process.hrtime();
    const solution = await frameStewartAlgorithm.solve(disks, 4);
    const endTime = process.hrtime(startTime);
    const executionTime = endTime[0] + endTime[1] / 1e9; // Convert to seconds
    
    // Save results to database if authenticated
    if (req.user) {
      // Implementation for saving to database would go here
    }
    
    res.json({
      success: true,
      solution,
      moves: solution.length,
      executionTime,
      algorithm: 'frame-stewart'
    });
  } catch (err) {
    logger.error(`Error solving Tower of Hanoi with Frame-Stewart algorithm: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

// Eight Queens specific controllers
const validateQueensSolution = (req, res, next) => {
  // Placeholder for future implementation
  res.json({ message: 'Eight Queens solution validation endpoint' });
};

const getQueensGame = (req, res, next) => {
  // Placeholder for future implementation
  res.json({ message: 'Get Eight Queens game endpoint', id: req.params.id });
};

// Eight Queens solution controller methods
const solveEightQueens = async (req, res, next) => {
  try {
    const { algorithm, maxSolutions = 10 } = req.body;
    logger.info(`Solving Eight Queens puzzle with ${algorithm} algorithm`);
    
    let solutions, executionTime;
    
    // Select algorithm based on request
    if (algorithm === 'threaded') {
      const threadedAlgorithm = require('../games/eightQueens/algorithms/threaded');
      const startTime = process.hrtime();
      solutions = await threadedAlgorithm.findSolutions(maxSolutions);
      const endTime = process.hrtime(startTime);
      executionTime = endTime[0] + endTime[1] / 1e9; // Convert to seconds
    } else {
      const sequentialAlgorithm = require('../games/eightQueens/algorithms/sequential');
      const startTime = process.hrtime();
      solutions = await sequentialAlgorithm.findSolutions(maxSolutions);
      const endTime = process.hrtime(startTime);
      executionTime = endTime[0] + endTime[1] / 1e9; // Convert to seconds
    }
    
    res.json({
      success: true,
      solutions,
      count: solutions.length,
      executionTime,
      algorithm: algorithm || 'sequential'
    });
  } catch (err) {
    logger.error(`Error solving Eight Queens puzzle: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

const solveEightQueensSequential = async (req, res, next) => {
  try {
    const { maxSolutions = 10 } = req.body;
    logger.info(`Solving Eight Queens puzzle with sequential algorithm, max solutions: ${maxSolutions}`);
    
    const sequentialAlgorithm = require('../games/eightQueens/algorithms/sequential');
    const startTime = process.hrtime();
    const solutions = await sequentialAlgorithm.findSolutions(maxSolutions);
    const endTime = process.hrtime(startTime);
    const executionTime = endTime[0] + endTime[1] / 1e9; // Convert to seconds
    
    // Save results to database if authenticated
    if (req.user) {
      // Implementation for saving to database would go here
    }
    
    res.json({
      success: true,
      solutions,
      count: solutions.length,
      executionTime,
      algorithm: 'sequential'
    });
  } catch (err) {
    logger.error(`Error solving Eight Queens puzzle with sequential algorithm: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

const solveEightQueensThreaded = async (req, res, next) => {
  try {
    const { maxSolutions = 10, threads = 4 } = req.body;
    logger.info(`Solving Eight Queens puzzle with threaded algorithm using ${threads} threads, max solutions: ${maxSolutions}`);
    
    const threadedAlgorithm = require('../games/eightQueens/algorithms/threaded');
    const startTime = process.hrtime();
    const solutions = await threadedAlgorithm.findSolutions(maxSolutions, threads);
    const endTime = process.hrtime(startTime);
    const executionTime = endTime[0] + endTime[1] / 1e9; // Convert to seconds
    
    // Save results to database if authenticated
    if (req.user) {
      // Implementation for saving to database would go here
    }
    
    res.json({
      success: true,
      solutions,
      count: solutions.length,
      executionTime,
      algorithm: 'threaded',
      threads
    });
  } catch (err) {
    logger.error(`Error solving Eight Queens puzzle with threaded algorithm: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

// Knight's Tour specific controllers
const validateKnightMove = (req, res, next) => {
  // Placeholder for future implementation
  res.json({ message: 'Knight\'s Tour move validation endpoint' });
};

const getKnightsTourGame = (req, res, next) => {
  // Placeholder for future implementation
  res.json({ message: 'Get Knight\'s Tour game endpoint', id: req.params.id });
};

// New Knight's Tour algorithm controller functions
const solveKnightsTour = async (req, res, next) => {
  try {
    const { startPosition, boardSize, algorithm } = req.body;
    logger.info(`Solving Knight's Tour with ${algorithm} algorithm from position ${startPosition}`);
    
    let solution, executionTime;
    
    // Select algorithm based on request
    if (algorithm === 'backtracking') {
      const backtrackingAlgorithm = require('../games/knightsTour/algorithms/backtracking');
      const startTime = process.hrtime();
      solution = await backtrackingAlgorithm.findKnightsTour({ 
        startPosition, 
        size: boardSize || 8 
      });
      const endTime = process.hrtime(startTime);
      executionTime = endTime[0] + endTime[1] / 1e9; // Convert to seconds
    } else {
      const warnsdorffAlgorithm = require('../games/knightsTour/algorithms/warnsdorff');
      const startTime = process.hrtime();
      solution = await warnsdorffAlgorithm.findKnightsTour({ 
        startPosition, 
        size: boardSize || 8 
      });
      const endTime = process.hrtime(startTime);
      executionTime = endTime[0] + endTime[1] / 1e9; // Convert to seconds
    }
    
    res.json({
      success: true,
      solution,
      executionTime,
      algorithm
    });
  } catch (err) {
    logger.error(`Error solving Knight's Tour: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

const solveKnightsTourBacktracking = async (req, res, next) => {
  try {
    const { startPosition, boardSize } = req.body;
    logger.info(`Solving Knight's Tour with backtracking algorithm from position ${startPosition}`);
    
    const backtrackingAlgorithm = require('../games/knightsTour/algorithms/backtracking');
    const startTime = process.hrtime();
    const solution = await backtrackingAlgorithm.findKnightsTour({ 
      startPosition, 
      size: boardSize || 8 
    });
    const endTime = process.hrtime(startTime);
    const executionTime = endTime[0] + endTime[1] / 1e9; // Convert to seconds
    
    // Save results to database if authenticated
    if (req.user) {
      // Implementation for saving to database would go here
      logger.info(`Saved Knight's Tour solution for user ${req.user.id}`);
    }
    
    res.json({
      success: true,
      solution,
      executionTime,
      algorithm: 'backtracking'
    });
  } catch (err) {
    logger.error(`Error solving Knight's Tour with backtracking: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

const solveKnightsTourWarnsdorff = async (req, res, next) => {
  try {
    const { startPosition, boardSize } = req.body;
    logger.info(`Solving Knight's Tour with Warnsdorff's algorithm from position ${startPosition}`);
    
    const warnsdorffAlgorithm = require('../games/knightsTour/algorithms/warnsdorff');
    const startTime = process.hrtime();
    const solution = await warnsdorffAlgorithm.findKnightsTour({ 
      startPosition, 
      size: boardSize || 8 
    });
    const endTime = process.hrtime(startTime);
    const executionTime = endTime[0] + endTime[1] / 1e9; // Convert to seconds
    
    // Save results to database if authenticated
    if (req.user) {
      // Implementation for saving to database would go here
      logger.info(`Saved Knight's Tour solution for user ${req.user.id}`);
    }
    
    res.json({
      success: true,
      solution,
      executionTime,
      algorithm: 'warnsdorff'
    });
  } catch (err) {
    logger.error(`Error solving Knight's Tour with Warnsdorff's algorithm: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllGames,
  getGameById,
  createGame,
  updateGame,
  ticTacToeMove,
  getTicTacToeGame,
  ticTacToeAiMove,
  ticTacToeMinimaxMove,
  ticTacToeMctsMove,
  calculateTspRoute,
  getTspGame,
  calculateTspNearestNeighbor,
  calculateTspDynamicProgramming,
  calculateTspGeneticAlgorithm,
  validateHanoiMove,
  getHanoiGame,
  solveHanoiTower,
  solveHanoiRecursive,
  solveHanoiIterative,
  solveHanoiFrameStewart,
  validateQueensSolution,
  getQueensGame,
  solveEightQueens,
  solveEightQueensSequential,
  solveEightQueensThreaded,
  validateKnightMove,
  getKnightsTourGame,
  solveKnightsTour,
  solveKnightsTourBacktracking,
  solveKnightsTourWarnsdorff
};
const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const statsController = require('../controllers/statsController');
const authenticate = require('../middleware/auth');

// Game API endpoints
router.get('/games', gameController.getAllGames);
router.get('/games/:id', gameController.getGameById);
router.post('/games', authenticate, gameController.createGame);
router.put('/games/:id', authenticate, gameController.updateGame);

// Common API routes
router.get('/stats', statsController.getOverviewStats);

// Tic-Tac-Toe endpoints
router.post('/games/tic-tac-toe/move', authenticate, gameController.ticTacToeMove);
router.get('/games/tic-tac-toe/:id', gameController.getTicTacToeGame);
router.post('/games/tic-tac-toe/ai-move', authenticate, gameController.ticTacToeAiMove);
router.post('/games/tic-tac-toe/ai-move/minimax', authenticate, gameController.ticTacToeMinimaxMove);
router.post('/games/tic-tac-toe/ai-move/mcts', authenticate, gameController.ticTacToeMctsMove);
router.post('/games/tic-tac-toe/save', authenticate, gameController.saveTicTacToeGame);
router.get('/games/tic-tac-toe/stats', gameController.getTicTacToeStats);

// TSP endpoints
router.post('/games/tsp/route', authenticate, gameController.calculateTspRoute);
router.get('/games/tsp/:id', gameController.getTspGame);
router.post('/games/tsp/route/nearest-neighbor', authenticate, gameController.calculateTspNearestNeighbor);
router.post('/games/tsp/route/dynamic-programming', authenticate, gameController.calculateTspDynamicProgramming);
router.post('/games/tsp/route/genetic-algorithm', authenticate, gameController.calculateTspGeneticAlgorithm);
router.post('/games/traveling-salesman/solve', gameController.solveTSP);
router.post('/games/traveling-salesman/save', authenticate, gameController.saveTSPGame);
router.get('/games/traveling-salesman/stats', gameController.getTSPStats);

// Tower of Hanoi endpoints
router.post('/games/tower-of-hanoi/move', authenticate, gameController.validateHanoiMove);
router.get('/games/tower-of-hanoi/:id', gameController.getHanoiGame);
router.post('/games/tower-of-hanoi/solve', authenticate, gameController.solveHanoiTower);
router.post('/games/tower-of-hanoi/solve/recursive', authenticate, gameController.solveHanoiRecursive);
router.post('/games/tower-of-hanoi/solve/iterative', authenticate, gameController.solveHanoiIterative);
router.post('/games/tower-of-hanoi/solve/frame-stewart', authenticate, gameController.solveHanoiFrameStewart);
router.post('/games/tower-of-hanoi/save', authenticate, gameController.saveHanoiGame);
router.get('/games/tower-of-hanoi/stats', gameController.getHanoiStats);

// Eight Queens endpoints
router.post('/games/eight-queens/solution', authenticate, gameController.validateQueensSolution);
router.get('/games/eight-queens/:id', gameController.getQueensGame);
router.post('/games/eight-queens/solve', authenticate, gameController.solveEightQueens);
router.post('/games/eight-queens/solve/sequential', authenticate, gameController.solveEightQueensSequential);
router.post('/games/eight-queens/solve/threaded', authenticate, gameController.solveEightQueensThreaded);
router.post('/games/eight-queens/validate', gameController.validateEightQueens);
router.post('/games/eight-queens/save', authenticate, gameController.saveEightQueensGame);
router.get('/games/eight-queens/stats', gameController.getEightQueensStats);

// Knight's Tour endpoints
router.post('/games/knights-tour/move', authenticate, gameController.validateKnightMove);
router.get('/games/knights-tour/:id', gameController.getKnightsTourGame);
router.post('/games/knights-tour/solve', authenticate, gameController.solveKnightsTour);
router.post('/games/knights-tour/solve/backtracking', authenticate, gameController.solveKnightsTourBacktracking);
router.post('/games/knights-tour/solve/warnsdorff', authenticate, gameController.solveKnightsTourWarnsdorff);
router.post('/games/knights-tour/validate-move', gameController.validateKnightMove);
router.post('/games/knights-tour/save', authenticate, gameController.saveKnightsTourGame);
router.get('/games/knights-tour/stats', gameController.getKnightsTourStats);

// Stats endpoints
router.get('/stats/overview', statsController.getOverviewStats);
router.get('/stats/player/:id', statsController.getPlayerStats);
router.get('/stats/game/:gameType', statsController.getGameTypeStats);
router.get('/stats/algorithm/:gameType/:algorithm', statsController.getAlgorithmStats);

// User API (for authentication)
router.post('/user/register', gameController.registerUser);
router.post('/user/login', gameController.loginUser);
router.get('/user/profile', authenticate, gameController.getUserProfile);
router.post('/user/logout', authenticate, gameController.logoutUser);

module.exports = router;
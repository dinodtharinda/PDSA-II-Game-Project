import express from 'express';
import * as gameController from '../controllers/gameController.js';
import * as statsController from '../controllers/statsController.js';
import authenticate from '../middleware/auth.js';

const router = express.Router();

// Game API endpoints
router.get('/games', authenticate, gameController.getAllGames);
router.get('/games/:id', gameController.getGameById);
router.post('/games', authenticate, gameController.createGame);
router.put('/games/:id', authenticate, gameController.updateGame);

// Authentication endpoints
router.post('/user/register', gameController.registerUser);
router.post('/user/login', gameController.loginUser);
router.post('/user/logout', authenticate, gameController.logoutUser);
router.get('/user/profile', authenticate, gameController.getUserProfile);

// Stats endpoints
router.get('/stats/overview', statsController.getOverviewStats);
router.get('/stats/player/:id', authenticate, statsController.getPlayerStats);
router.get('/stats/game/:gameType', statsController.getGameTypeStats);
router.get('/stats/algorithm/:gameType/:algorithm', statsController.getAlgorithmStats);

// Tic-Tac-Toe endpoints
router.post('/games/tic-tac-toe/move', authenticate, gameController.ticTacToeMove);
router.get('/games/tic-tac-toe/:id', gameController.getTicTacToeGame);
router.post('/games/tic-tac-toe/ai-move', authenticate, gameController.ticTacToeAiMove);
router.post('/games/tic-tac-toe/ai-move/minimax', authenticate, gameController.ticTacToeMinimaxMove);
router.post('/games/tic-tac-toe/ai-move/mcts', authenticate, gameController.ticTacToeMctsMove);

// TSP endpoints
router.post('/games/tsp/route', authenticate, gameController.calculateTspRoute);
router.get('/games/tsp/:id', gameController.getTspGame);
router.post('/games/tsp/route/nearest-neighbor', authenticate, gameController.calculateTspNearestNeighbor);
router.post('/games/tsp/route/dynamic-programming', authenticate, gameController.calculateTspDynamicProgramming);
router.post('/games/tsp/route/genetic-algorithm', authenticate, gameController.calculateTspGeneticAlgorithm);

// Tower of Hanoi endpoints
router.post('/games/tower-of-hanoi/move', authenticate, gameController.validateHanoiMove);
router.get('/games/tower-of-hanoi/:id', gameController.getHanoiGame);
router.post('/games/tower-of-hanoi/solve', authenticate, gameController.solveHanoiTower);
router.post('/games/tower-of-hanoi/solve/recursive', authenticate, gameController.solveHanoiRecursive);
router.post('/games/tower-of-hanoi/solve/iterative', authenticate, gameController.solveHanoiIterative);
router.post('/games/tower-of-hanoi/solve/frame-stewart', authenticate, gameController.solveHanoiFrameStewart);

// Eight Queens endpoints
router.post('/games/eight-queens/solution', authenticate, gameController.validateQueensSolution);
router.get('/games/eight-queens/:id', gameController.getQueensGame);
router.post('/games/eight-queens/solve', authenticate, gameController.solveEightQueens);
router.post('/games/eight-queens/solve/sequential', authenticate, gameController.solveEightQueensSequential);
router.post('/games/eight-queens/solve/threaded', authenticate, gameController.solveEightQueensThreaded);

// Knight's Tour endpoints
router.post('/games/knights-tour/move', authenticate, gameController.validateKnightMove);
router.get('/games/knights-tour/:id', gameController.getKnightsTourGame);
router.post('/games/knights-tour/solve', authenticate, gameController.solveKnightsTour);
router.post('/games/knights-tour/solve/backtracking', authenticate, gameController.solveKnightsTourBacktracking);
router.post('/games/knights-tour/solve/warnsdorff', authenticate, gameController.solveKnightsTourWarnsdorff);

export default router;
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

// Tic-Tac-Toe endpoints
router.post('/games/tic-tac-toe/move', authenticate, gameController.ticTacToeMove);
router.get('/games/tic-tac-toe/:id', gameController.getTicTacToeGame);

// TSP endpoints
router.post('/games/tsp/route', authenticate, gameController.calculateTspRoute);
router.get('/games/tsp/:id', gameController.getTspGame);

// Tower of Hanoi endpoints
router.post('/games/tower-of-hanoi/move', authenticate, gameController.validateHanoiMove);
router.get('/games/tower-of-hanoi/:id', gameController.getHanoiGame);

// Eight Queens endpoints
router.post('/games/eight-queens/solution', authenticate, gameController.validateQueensSolution);
router.get('/games/eight-queens/:id', gameController.getQueensGame);

// Knight's Tour endpoints
router.post('/games/knights-tour/move', authenticate, gameController.validateKnightMove);
router.get('/games/knights-tour/:id', gameController.getKnightsTourGame);

// Stats endpoints
router.get('/stats/overview', statsController.getOverviewStats);
router.get('/stats/player/:id', statsController.getPlayerStats);
router.get('/stats/game/:gameType', statsController.getGameTypeStats);
router.get('/stats/algorithm/:gameType/:algorithm', statsController.getAlgorithmStats);

module.exports = router;
import express from 'express';
import * as gameController from '../controllers/gameController.js';
import * as statsController from '../controllers/statsController.js';
import authenticate from '../middleware/auth.js';

const router = express.Router();

// Home page
router.get('/', (req, res) => {
  res.render('pages/index', { title: 'PDSA-II Game Project', path: '/' });
});

// Game pages
router.get('/tic-tac-toe', (req, res) => {
  res.render('pages/ticTacToe', { title: 'Tic-Tac-Toe Game', path: '/tic-tac-toe' });
});

router.get('/traveling-salesman', (req, res) => {
  res.render('pages/travelingSalesman', { title: 'Traveling Salesman Problem', path: '/traveling-salesman' });
});

router.get('/tower-of-hanoi', (req, res) => {
  res.render('pages/towerOfHanoi', { title: 'Tower of Hanoi', path: '/tower-of-hanoi' });
});

router.get('/eight-queens', (req, res) => {
  res.render('pages/eightQueens', { title: 'Eight Queens Puzzle', path: '/eight-queens' });
});

router.get('/knights-tour', (req, res) => {
  res.render('pages/knightsTour', { 
    title: 'Knight\'s Tour Problem', 
    path: '/knights-tour',
    layout: 'layouts/main', // Keep layout explicit
    pageScripts: [
      '/src/games/knightsTour/gameLoader.js' // Use a dedicated loader script
    ]
  });
});

// Stats page - Removed for now as the view is missing
// router.get('/stats', (req, res) => {
//   res.render('pages/stats', { title: 'Game Statistics', path: '/stats' });
// });

// Player registration & login
router.get('/login', (req, res) => {
  res.render('pages/login', { title: 'Login', path: '/login' });
});

router.post('/login', (req, res) => {
  // TODO: Implement login logic
  res.redirect('/');
});

router.get('/register', (req, res) => {
  res.render('pages/register', { title: 'Register', path: '/register' });
});

router.post('/register', (req, res) => {
  // TODO: Implement registration logic
  res.redirect('/login');
});

router.get('/logout', (req, res) => {
  // TODO: Implement logout logic
  req.session.destroy();
  res.redirect('/');
});

export default router;
const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const statsController = require('../controllers/statsController');
const authenticate = require('../middleware/auth');

// Home page
router.get('/', (req, res) => {
  res.render('pages/index', { title: 'PDSA-II Game Project' });
});

// Game pages
router.get('/tic-tac-toe', (req, res) => {
  res.render('pages/ticTacToe', { title: 'Tic-Tac-Toe Game' });
});

router.get('/traveling-salesman', (req, res) => {
  res.render('pages/tsp', { title: 'Traveling Salesman Problem' });
});

router.get('/tower-of-hanoi', (req, res) => {
  res.render('pages/towerOfHanoi', { title: 'Tower of Hanoi' });
});

router.get('/eight-queens', (req, res) => {
  res.render('pages/eightQueens', { title: 'Eight Queens Puzzle' });
});

router.get('/knights-tour', (req, res) => {
  res.render('pages/knightsTour', { title: 'Knight\'s Tour Problem' });
});

// Stats page
router.get('/stats', (req, res) => {
  res.render('pages/stats', { title: 'Game Statistics' });
});

// Player registration & login
router.get('/login', (req, res) => {
  res.render('pages/login', { title: 'Login' });
});

router.post('/login', (req, res) => {
  // TODO: Implement login logic
  res.redirect('/');
});

router.get('/register', (req, res) => {
  res.render('pages/register', { title: 'Register' });
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

module.exports = router;
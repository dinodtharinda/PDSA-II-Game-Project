import express from 'express';
import session from 'express-session';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import logger from './utils/logger.js';
import errorHandler from './middleware/errorHandler.js';
import authMiddleware from './middleware/auth.js';
import apiRoutes from './routes/api.js';
import pageRoutes from './routes/pages.js';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;
const isDev = process.env.NODE_ENV !== 'production';

async function createServer() {
  // Create Vite server in middleware mode
  const vite = isDev ? await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom'
  }) : null;

  // Use Vite's connect instance as middleware
  if (isDev) {
    app.use(vite.middlewares);
  }

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(join(__dirname, '../public')));

  // Session configuration
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secure_session_secret_here',
    name: process.env.SESSION_NAME || 'game_session',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // View engine setup
  app.set('view engine', 'ejs');
  app.set('views', join(__dirname, '../views'));

  // Routes
  app.use('/api', authMiddleware, apiRoutes);
  app.use('/', pageRoutes);

  // Game routes
  app.get('/games/tic-tac-toe', (req, res) => res.render('pages/ticTacToe'));
  app.get('/games/tower-of-hanoi', (req, res) => res.render('pages/towerOfHanoi'));
  app.get('/games/eight-queens', (req, res) => res.render('pages/eightQueens'));
  app.get('/games/knights-tour', (req, res) => res.render('pages/knightsTour'));
  app.get('/games/traveling-salesman', (req, res) => res.render('pages/travelingSalesman'));

  // Error handling
  app.use(errorHandler);

  // Start server
  app.listen(port, () => {
    logger.info(`Server running on port ${port}`);
  });
}

createServer();
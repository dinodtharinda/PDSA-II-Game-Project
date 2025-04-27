import express from 'express';
import session from 'express-session';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import expressLayouts from 'express-ejs-layouts'; // Import express-ejs-layouts
import logger from './utils/logger.js';
import errorHandler from './middleware/errorHandler.js';
import authMiddleware from './middleware/auth.js';
import apiRoutes from './routes/api.js';
import pageRoutes from './routes/pages.js';
import { createServer as createViteServer } from 'vite';
import { initializeDatabase } from './config/db.js';
import { initModels } from './models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;
const isDev = process.env.NODE_ENV !== 'production';

async function createServer() {
  try {
    // Initialize database connection
    await initializeDatabase();
    
    // Initialize models
    await initModels();

    // View engine setup (Must be before Vite middleware if using layouts)
    app.use(expressLayouts); // Use express-ejs-layouts middleware
    app.set('layout', './layouts/main'); // Specify the default layout file
    app.set('view engine', 'ejs');
    app.set('views', join(__dirname, '../views'));
    
    // Create Vite server in middleware mode
    const vite = isDev ? await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
      optimizeDeps: {
        // Exclude server-side dependencies from client-side optimization
        exclude: [
          'express',
          'sequelize',
          'sqlite3',
          'express-session',
          'cors',
          'express-ejs-layouts',
          'bcrypt',
          'winston',
          'winston-daily-rotate-file',
          'dotenv'
          // Add any other purely server-side modules here
        ],
        // Optionally include specific client-side deps if needed
        // include: ['some-client-dep']
      }
    }) : null;

    // Use Vite's connect instance as middleware (after layout setup)
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

    // Routes
    app.use('/api', authMiddleware, apiRoutes);
    app.use('/', pageRoutes);

    // Add a simple handler for favicon.ico to prevent 404s
    app.get('/favicon.ico', (req, res) => res.status(204).end());

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
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
}

createServer();
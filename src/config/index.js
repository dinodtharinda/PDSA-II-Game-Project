import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Initialize dotenv
dotenv.config();

const config = {
  app: {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 3000,
  },
  session: {
    secret: process.env.SESSION_SECRET || 'your_secure_session_secret_here',
    name: process.env.SESSION_NAME || 'game_session',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  },
  db: {
    path: process.env.DB_PATH || 'database/game.db',
    options: {
      dialect: 'sqlite',
      logging: process.env.NODE_ENV === 'development',
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    dir: process.env.LOG_DIR || 'logs'
  },
  game: {
    maxTime: parseInt(process.env.MAX_GAME_TIME, 10) || 3600,
    maxMoves: parseInt(process.env.MAX_MOVES, 10) || 1000
  }
};

// Validate critical configuration
const requiredEnvVars = ['SESSION_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

// Freeze configuration to prevent modifications
Object.freeze(config);
Object.keys(config).forEach(key => Object.freeze(config[key]));

export default config;
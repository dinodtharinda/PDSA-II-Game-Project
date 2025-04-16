// Database seed script
const sequelize = require('../src/config/db');
const Player = require('../src/models/player');
const Game = require('../src/models/game');
const logger = require('../src/utils/logger');
const path = require('path');
const { createTables } = require('../database/migrations/create-tables');

async function seed() {
  try {
    // Ensure tables are created
    createTables();
    
    // Sync models with database
    await sequelize.sync({ force: false });
    logger.info('Database models synced!');

    // Create sample players
    const players = await Player.bulkCreate([
      { name: 'John Doe' },
      { name: 'Jane Smith' },
      { name: 'Alice Johnson' },
      { name: 'Bob Williams' },
      { name: 'Carol Brown' }
    ]);
    logger.info('Sample players created!');

    // Create sample games
    const games = await Game.bulkCreate([
      { 
        game_type: 'ticTacToe', 
        player_id: 1, 
        result: 'win' 
      },
      { 
        game_type: 'ticTacToe', 
        player_id: 2, 
        result: 'loss' 
      },
      { 
        game_type: 'tsp', 
        player_id: 1, 
        result: 'completed' 
      },
      { 
        game_type: 'towerOfHanoi', 
        player_id: 3, 
        result: 'completed' 
      },
      { 
        game_type: 'eightQueens', 
        player_id: 4, 
        result: 'completed' 
      },
      { 
        game_type: 'knightsTour', 
        player_id: 5, 
        result: 'abandoned' 
      }
    ]);
    logger.info('Sample games created!');

    // Insert game-specific data
    const db = sequelize.getQueryInterface().sequelize;
    
    // Sample Tic-Tac-Toe data
    await db.query(`
      INSERT INTO tic_tac_toe (game_id, algorithm_type, move_time, move_number)
      VALUES 
        (1, 'minimax', 0.145, 1),
        (1, 'minimax', 0.231, 3),
        (1, 'minimax', 0.167, 5),
        (1, 'minimax', 0.198, 7),
        (1, 'minimax', 0.312, 9),
        (2, 'mcts', 0.178, 1),
        (2, 'mcts', 0.245, 3),
        (2, 'mcts', 0.289, 5)
    `);
    logger.info('Sample tic-tac-toe data created!');
    
    // Sample Traveling Salesman data
    await db.query(`
      INSERT INTO traveling_salesman (game_id, home_city, selected_cities, shortest_route, algorithm_type, execution_time)
      VALUES 
        (3, 'A', 'A,B,C,D,E', 'A,C,E,D,B,A', 'nearestNeighbor', 0.056),
        (3, 'A', 'A,B,C,D,E', 'A,B,D,E,C,A', 'dynamicProgramming', 0.178),
        (3, 'A', 'A,B,C,D,E', 'A,B,D,C,E,A', 'geneticAlgorithm', 0.345)
    `);
    logger.info('Sample traveling salesman data created!');
    
    // Sample Tower of Hanoi data
    await db.query(`
      INSERT INTO tower_of_hanoi (game_id, disk_count, move_count, move_sequence, algorithm_type, execution_time)
      VALUES 
        (4, 5, 31, '1->3,1->2,3->2,...', 'recursive', 0.023),
        (4, 5, 31, '1->3,1->2,3->2,...', 'iterative', 0.019),
        (4, 6, 63, '1->3,1->2,3->2,...', 'frameStewart', 0.042)
    `);
    logger.info('Sample tower of hanoi data created!');
    
    // Sample Eight Queens data
    await db.query(`
      INSERT INTO eight_queens (game_id, solution, solution_number, algorithm_type, execution_time, is_identified)
      VALUES 
        (5, 'a1,b3,c5,d7,e2,f4,g6,h8', 1, 'sequential', 0.067, true),
        (5, 'a1,b5,c8,d6,e3,f7,g2,h4', 2, 'sequential', 0.072, false),
        (5, 'a2,b4,c6,d8,e3,f1,g7,h5', 3, 'threaded', 0.038, true)
    `);
    logger.info('Sample eight queens data created!');
    
    // Sample Knights Tour data
    await db.query(`
      INSERT INTO knights_tour (game_id, start_position, move_sequence, algorithm_type, execution_time)
      VALUES 
        (6, 'd4', 'd4,b5,a7,c8,e7,g8,h6,f5,d6,b7,a5,c6,e5,g6,h8,f7,d8,b7,...', 'backtracking', 0.189),
        (6, 'd4', 'd4,f5,h6,g8,e7,c8,a7,b5,d6,f7,h8,g6,e5,c6,a5,b7,d8,c6,...', 'warnsdorff', 0.067)
    `);
    logger.info('Sample knights tour data created!');

    logger.info('Database seeding completed successfully!');
    
    // Exit process
    setTimeout(() => {
      process.exit(0);
    }, 1000);
  } catch (error) {
    logger.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();

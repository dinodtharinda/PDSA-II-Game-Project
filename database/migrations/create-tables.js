const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../game.db'),
  logging: false
});

async function migrate() {
  try {
    console.log('Starting database migration...');

    // Players table
    console.log('Creating players table...');
    await sequelize.getQueryInterface().createTable('players', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      role: {
        type: DataTypes.ENUM('player', 'admin'),
        defaultValue: 'player'
      },
      verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      verification_token: {
        type: DataTypes.STRING,
        allowNull: true
      },
      reset_password_token: {
        type: DataTypes.STRING,
        allowNull: true
      },
      reset_password_expires: {
        type: DataTypes.DATE,
        allowNull: true
      },
      last_login: {
        type: DataTypes.DATE,
        allowNull: true
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });
    console.log('Players table created successfully');

    // Games table
    console.log('Creating games table...');
    await sequelize.getQueryInterface().createTable('games', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      player_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'players',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      game_type: {
        type: DataTypes.ENUM(
          'ticTacToe',
          'tsp',
          'towerOfHanoi',
          'eightQueens',
          'knightsTour'
        ),
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM(
          'in_progress',
          'completed',
          'abandoned'
        ),
        defaultValue: 'in_progress'
      },
      start_time: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      end_time: {
        type: DataTypes.DATE,
        allowNull: true
      },
      duration_seconds: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      moves: {
        type: DataTypes.JSON,
        defaultValue: '[]'
      },
      score: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      algorithm_used: {
        type: DataTypes.STRING,
        allowNull: true
      },
      solution_found: {
        type: DataTypes.BOOLEAN,
        allowNull: true
      },
      execution_time: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      settings: {
        type: DataTypes.JSON,
        defaultValue: '{}'
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });
    console.log('Games table created successfully');

    // Performances table
    console.log('Creating performances table...');
    await sequelize.getQueryInterface().createTable('performances', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      game_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'games',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      algorithm_name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      execution_time: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
      memory_used: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      iterations: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      solution_quality: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      parameters: {
        type: DataTypes.JSON,
        defaultValue: '{}'
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });
    console.log('Performances table created successfully');

    // Add indexes
    console.log('Creating indexes...');
    await sequelize.getQueryInterface().addIndex('games', ['player_id']);
    await sequelize.getQueryInterface().addIndex('games', ['game_type']);
    await sequelize.getQueryInterface().addIndex('games', ['start_time']);
    await sequelize.getQueryInterface().addIndex('performances', ['game_id']);
    await sequelize.getQueryInterface().addIndex('performances', ['algorithm_name']);
    console.log('Indexes created successfully');

    // Create admin user
    console.log('Creating admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await sequelize.getQueryInterface().bulkInsert('players', [{
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
      verified: true,
      created_at: new Date(),
      updated_at: new Date()
    }]);
    console.log('Admin user created successfully');

    console.log('Database migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrate();
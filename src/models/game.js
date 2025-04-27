import { Model, DataTypes } from 'sequelize';
import { getSequelize } from '../config/db.js';

// Initialize sequelize instance
let sequelize;
// This will be populated by initModel function
let Game;

// Async initialization function
export const initModel = async () => {
  if (!sequelize) {
    sequelize = await getSequelize();
    
    Game = class Game extends Model {};
    
    Game.init({
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
        }
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
        defaultValue: DataTypes.NOW
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
        defaultValue: []
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
        allowNull: true,
        comment: 'Algorithm execution time in seconds'
      },
      settings: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Game-specific settings (e.g., board size, difficulty)'
      }
    }, {
      sequelize,
      modelName: 'Game',
      tableName: 'games',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          fields: ['player_id']
        },
        {
          fields: ['game_type']
        },
        {
          fields: ['start_time']
        }
      ]
    });
  }
  
  return Game;
};

// Associate with Player model
export const associate = models => {
  const Game = models.Game || global.Game;
  if (Game) {
    Game.belongsTo(models.Player, {
      foreignKey: 'player_id',
      as: 'player'
    });
  }
};

// For compatibility with existing code
const gameModelExport = { initModel, associate };
export default gameModelExport;

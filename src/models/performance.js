import { Model, DataTypes } from 'sequelize';
import { getSequelize } from '../config/db.js';

// Initialize sequelize instance
let sequelize;
// This will be populated by initModel function
let Performance;

// Async initialization function
export const initModel = async () => {
  if (!sequelize) {
    sequelize = await getSequelize();
    
    Performance = class Performance extends Model {};
    
    Performance.init({
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
        }
      },
      algorithm_name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      execution_time: {
        type: DataTypes.FLOAT,
        allowNull: false,
        comment: 'Algorithm execution time in seconds'
      },
      memory_used: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Memory usage in bytes'
      },
      iterations: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Number of iterations/steps'
      },
      solution_quality: {
        type: DataTypes.FLOAT,
        allowNull: true,
        comment: 'Quality metric (e.g., path length for TSP)'
      },
      parameters: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Algorithm-specific parameters used'
      }
    }, {
      sequelize,
      modelName: 'Performance',
      tableName: 'performances',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          fields: ['game_id']
        },
        {
          fields: ['algorithm_name']
        }
      ]
    });
  }
  
  return Performance;
};

// Associate with Game model
export const associate = models => {
  const Performance = models.Performance || global.Performance;
  if (Performance && models.Game) {
    Performance.belongsTo(models.Game, {
      foreignKey: 'game_id',
      as: 'game'
    });
  }
};

// For compatibility with existing code
const performanceModelExport = { initModel, associate };
export default performanceModelExport;
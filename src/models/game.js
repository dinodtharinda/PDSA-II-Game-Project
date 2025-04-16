// Game model definition
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Player = require('./player');

const Game = sequelize.define('Game', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  game_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  start_time: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  end_time: {
    type: DataTypes.DATE
  },
  player_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Player,
      key: 'id'
    }
  },
  result: {
    type: DataTypes.STRING
  }
}, {
  tableName: 'games',
  timestamps: false
});

// Define association
Game.belongsTo(Player, { foreignKey: 'player_id' });
Player.hasMany(Game, { foreignKey: 'player_id' });

module.exports = Game;

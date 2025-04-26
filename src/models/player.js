import { Model, DataTypes } from 'sequelize';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { getSequelize } from '../config/db.js';
import logger from '../utils/logger.js';

// Initialize sequelize instance
let sequelize;
// This will be populated by initModel function
let Player;

// Async initialization function
export const initModel = async () => {
  if (!sequelize) {
    sequelize = await getSequelize();
    
    Player = class Player extends Model {
      static async register({ username, email, password, role = 'player' }) {
        const hashedPassword = await bcrypt.hash(password, 10);
        return this.create({
          username,
          email,
          password: hashedPassword,
          role
        });
      }
    
      static async findByEmail(email) {
        return this.findOne({ where: { email } });
      }
    
      async verifyPassword(password) {
        return bcrypt.compare(password, this.password);
      }
    
      async generateVerificationToken() {
        const token = crypto.randomBytes(32).toString('hex');
        await this.update({ verification_token: token });
        return token;
      }
    };
    
    Player.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          len: [3, 30]
        }
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        }
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
      }
    }, {
      sequelize,
      modelName: 'Player',
      tableName: 'players',
      timestamps: true,
      underscored: true
    });
  }
  
  return Player;
};

// Initialize immediately if not in a test environment
if (process.env.NODE_ENV !== 'test') {
  initModel().catch(error => {
    logger.error('Failed to initialize Player model:', error);
  });
}

// Associate with other models
export const associate = models => {
  const Player = models.Player || global.Player;
  if (Player && models.Game) {
    Player.hasMany(models.Game, {
      foreignKey: 'player_id',
      as: 'games'
    });
  }
};

// For compatibility with existing code
const playerModelExport = { initModel, associate };
export default playerModelExport;

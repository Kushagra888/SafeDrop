import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { User } from './user.models.js';

const File = sequelize.define('File', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  path: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  size: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  downloadedContent: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  // Optional Password Protection
  isPasswordProtected: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  password: {
    type: DataTypes.STRING,
    defaultValue: null
  },
  // Optional Expiry
  hasExpiry: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  expiresAt: {
    type: DataTypes.DATE,
    defaultValue: null
  },
  // Status (active/expired)
  status: {
    type: DataTypes.STRING,
    defaultValue: 'active',
    validate: {
      isIn: [['active', 'expired']]
    }
  },
  shortUrl: {
    type: DataTypes.STRING,
    defaultValue: null
  },
  shortCode: {
    type: DataTypes.STRING,
    unique: true
  }
}, {
  timestamps: true
});

// Define the relationship between File and User
File.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'creator'
});

User.hasMany(File, {
  foreignKey: 'createdBy',
  as: 'files'
});

export { File };

import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import sequelize from '../config/database.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fullname: {
    type: DataTypes.STRING,
    allowNull: false
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  totalUploads: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalDownloads: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  videoCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  imageCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  documentCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  profilePic: {
    type: DataTypes.STRING,
    defaultValue: 'https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff'
  },
  lastLogin: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    }
  }
});

export { User };
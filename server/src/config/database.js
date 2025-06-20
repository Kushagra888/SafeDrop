import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

const DB_NAME = process.env.DB_NAME || 'safedrop';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || 'root';
const DB_HOST = process.env.DB_HOST || 'localhost';

const createDatabaseIfNotExists = async () => {
  try {
    console.log('🔄 Connecting to MySQL server...');
    
    const connection = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD
    });

    console.log('🔄 Checking if database exists...');
    
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${DB_NAME};`);
    console.log(`✅ Database '${DB_NAME}' is ready.`);
    
    await connection.end();
    return true;
  } catch (error) {
    console.error('❌ Error creating database:', error);
    return false;
  }
};

const sequelize = new Sequelize(
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  {
    host: DB_HOST,
    dialect: 'mysql',
    logging: console.log, // Enable logging for debugging
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

export const initDatabase = async () => {
  try {
    // First create the database if it doesn't exist
    console.log('🔄 Attempting to create database if it does not exist...');
    const dbCreated = await createDatabaseIfNotExists();
    if (!dbCreated) {
      console.error('❌ Failed to create database');
      throw new Error('Failed to create database');
    }

    // Test the connection
    console.log('🔄 Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ MySQL database connection has been established successfully.');
    
    // Sync all models with database
    console.log('🔄 Synchronizing models with database...');
    await sequelize.sync({ alter: true });
    console.log('✅ Database tables synchronized successfully.');
    
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    return false;
  }
};

export default sequelize; 
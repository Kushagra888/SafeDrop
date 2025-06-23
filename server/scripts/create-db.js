const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });

async function createDatabase() {
  try {
    console.log('Connecting to MySQL server...');
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root'
    });

    console.log('Connected to MySQL server successfully');
    console.log(`Creating database '${process.env.DB_NAME || 'safedrop'}'...`);
    
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'safedrop'}`);
    console.log(`Database '${process.env.DB_NAME || 'safedrop'}' created successfully`);
    
    await connection.end();
    console.log('Connection closed');
  } catch (error) {
    console.error('Error creating database:', error);
    process.exit(1);
  }
}

createDatabase(); 
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(process.env.DB_URL, {
  dialect: 'mysql',
  logging: console.log,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

export const initDatabase = async () => {
  try {
    // Test the connection
    console.log('🔄 Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ MySQL database connection has been established successfully.');
    
    // Sync all models with database
    console.log('🔄 Synchronizing models with database...');
    
    await sequelize.sync({ force: false, alter: false });
    console.log('✅ Database tables synchronized successfully.');
    
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    throw error;
  }
};

export default sequelize;
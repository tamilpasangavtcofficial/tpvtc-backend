const app = require('../src/app');
const { sequelize, connectDB } = require('../src/config/db');

// Database connection logic for serverless environment
const connectToDatabase = async () => {
  try {
    await connectDB();
    // In serverless, we usually rely on pre-existing tables.
    // However, if we need to sync, we can do it once.
    // await sequelize.sync({ force: false });
  } catch (error) {
    console.error('Initial DB connection failed:', error);
  }
};

connectToDatabase();

module.exports = app;

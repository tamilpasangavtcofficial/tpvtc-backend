const app = require('../src/app');
const { sequelize, connectDB } = require('../src/config/db');
require('mysql2'); // Explicitly required for Vercel's dependency tracer

// Database connection logic for serverless environment
const connectToDatabase = async () => {
  try {
    await connectDB();
    // Sync models to create any new tables (safe: does not drop existing tables)
    await sequelize.sync({ alter: false, force: false });
  } catch (error) {
    console.error('Initial DB connection failed:', error);
  }
};


connectToDatabase();

module.exports = app;

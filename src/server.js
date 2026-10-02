const app = require('./app');
const { sequelize, connectDB } = require('./config/db');
const seedDB = require('./utils/seed');

// IMPORTANT: Import all models & associations BEFORE sequelize.sync()
// This ensures every table (including new ones like Albums) is created on startup.
require('./models');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();
    
    try {
        // sync models with database
        // Using force: false (default) to only CREATE missing tables without altering existing ones.
        // alter: true can silently fail with MySQL foreign key constraints.
        await sequelize.sync({ force: false });
        console.log('Database schema synchronized');
        
        await seedDB();
    } catch (err) {
        console.error('Failed to sync/seed database:', err);
    }

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
};

startServer();

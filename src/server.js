const app = require('./app');
const { sequelize, connectDB } = require('./config/db');
const seedDB = require('./utils/seed');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();
    
    // sync models with database
    await sequelize.sync({ alter: true });
    console.log('Database schema synchronized');
    
    await seedDB();

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
};

startServer();

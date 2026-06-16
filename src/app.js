const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
const authRoutes = require('./routes/authRoutes');
const tmpRoutes = require('./routes/tmpRoutes');
const slotRoutes = require('./routes/slotRoutes');
const imageRoutes = require('./routes/imageRoutes');
const supporterRoutes = require('./routes/supporterRoutes');
const achievementRoutes = require('./routes/achievementRoutes');
const magazineRoutes = require('./routes/magazineRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/tmp', tmpRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/supporters', supporterRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/magazines', magazineRoutes);

app.get('/', (req, res) => {
    res.send('Tamil Pasanga VTC API is running...');
});

module.exports = app;

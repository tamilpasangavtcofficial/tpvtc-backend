const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const session = require('express-session');
const passport = require('passport');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use(session({
    secret: process.env.SESSION_SECRET || 'tpvtc-super-secret-key',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// Passport serialization
passport.serializeUser((user, done) => {
    done(null, user);
});
passport.deserializeUser((obj, done) => {
    done(null, obj);
});

// Routes
const authRoutes = require('./routes/authRoutes');
const tmpRoutes = require('./routes/tmpRoutes');
const slotRoutes = require('./routes/slotRoutes');
const imageRoutes = require('./routes/imageRoutes');
const supporterRoutes = require('./routes/supporterRoutes');
const achievementRoutes = require('./routes/achievementRoutes');
const magazineRoutes = require('./routes/magazineRoutes');
const partnerRoutes = require('./routes/partnerRoutes');
const statsRoutes = require('./routes/statsRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/tmp', tmpRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/supporters', supporterRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/magazines', magazineRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/stats', statsRoutes);

app.get('/', (req, res) => {
    res.send('Tamil Pasanga VTC API is running...');
});

module.exports = app;

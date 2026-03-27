const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

const adminOnly = (req, res, next) => {
    if (req.user && ['developer', 'founder', 'event team', 'media team', 'staff'].includes(req.user.role?.toLowerCase())) {
        next();
    } else {
        res.status(403).json({ message: 'Access denied' });
    }
};

module.exports = { auth, adminOnly };

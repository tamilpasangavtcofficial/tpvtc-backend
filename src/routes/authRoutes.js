const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User, UserRole } = require('../models');
const router = express.Router();

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ 
            where: { email },
            include: [{ model: UserRole }]
        });
        
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.UserRole.role },
            process.env.JWT_SECRET || 'secret'
        );
        
        // Update last login
        await user.update({ last_login_at: new Date() });
        
        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.UserRole.role
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

const { auth, adminOnly } = require('../middleware/auth');

// Get all users (Admin only)
router.get('/users', auth, adminOnly, async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] },
            include: [{ model: UserRole }]
        });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Add new user (Admin only)
router.post('/users', auth, adminOnly, async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        
        const exists = await User.findOne({ where: { email } });
        if (exists) return res.status(400).json({ message: 'User already exists' });
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const targetRole = String(role || 'Event Team').toLowerCase();
        const userRole = await UserRole.findOne({ where: { role: targetRole } });
        if (!userRole) return res.status(404).json({ message: `Role '${targetRole}' not found in system` });

        const user = await User.create({ 
            username, 
            email, 
            password: hashedPassword,
            role_id: userRole.id
        });
        
        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Change Password
router.put('/users/:userId/password', auth, async (req, res) => {
    try {
        const { password } = req.body;
        
        if (req.user.id !== parseInt(req.params.userId) && req.user.role !== 'Founder' && req.user.role !== 'Developer') {
             return res.status(403).json({ message: 'Unauthorized action' });
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        await User.update({ password: hashedPassword }, { where: { id: req.params.userId } });
        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update user details (Admin only)
router.put('/users/:userId', auth, adminOnly, async (req, res) => {
    try {
        const { username, role } = req.body;
        if (username) {
            await User.update({ username }, { where: { id: req.params.userId } });
        }
        if (role) {
            const targetRole = String(role).toLowerCase();
            const roleRec = await UserRole.findOne({ where: { role: targetRole } });
            if (roleRec) {
                await User.update({ role_id: roleRec.id }, { where: { id: req.params.userId } });
            }
        }
        res.json({ message: 'User updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete user (Admin only)
router.delete('/users/:id', auth, adminOnly, async (req, res) => {
    try {
        if (req.user.id === parseInt(req.params.id)) {
            return res.status(400).json({ message: 'Cannot delete yourself' });
        }
        await User.destroy({ where: { id: req.params.id } });
        res.json({ message: 'User removed' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

const express = require('express');
const { Achievement } = require('../models');
const { auth, adminOnly } = require('../middleware/auth');
const { Op } = require('sequelize');
const router = express.Router();

// Get latest achievement
router.get('/latest', async (req, res) => {
    try {
        const achievement = await Achievement.findOne({
            where: { published: true },
            order: [['createdAt', 'DESC']]
        });
        res.json(achievement);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all achievements (for history dropdown)
router.get('/all', async (req, res) => {
    try {
        const achievements = await Achievement.findAll({
            attributes: ['month'],
            order: [['createdAt', 'DESC']]
        });
        res.json(achievements);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Find achievement by month (POST used for better handling of spaces/special chars)
router.post('/find', async (req, res) => {
    try {
        const { month } = req.body;
        if (!month) return res.status(400).json({ message: 'Month is required' });
        
        const cleanMonth = month.trim();
        console.log('Finding achievements for:', cleanMonth);
        const achievement = await Achievement.findOne({ 
            where: { 
                month: { [Op.like]: `%${cleanMonth}%` }
            } 
        });
        res.json(achievement);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update or create achievement
router.post('/update', auth, adminOnly, async (req, res) => {
    try {
        const { 
            month, 
            winner_name, winner_role, winner_tmp_id, winner_event_id, winner_dlc,
            p1_name, p1_role, p1_tmp_id, p1_distance,
            p2_name, p2_role, p2_tmp_id, p2_distance,
            p3_name, p3_role, p3_tmp_id, p3_distance,
            published
        } = req.body;

        // We only want one record for the current month, or just update the latest one.
        // For simplicity, let's see if one for this month exists
        let achievement = await Achievement.findOne({ where: { month } });

        if (achievement) {
            await achievement.update({
                winner_name, winner_role, winner_tmp_id, winner_event_id, winner_dlc,
                p1_name, p1_role, p1_tmp_id, p1_distance,
                p2_name, p2_role, p2_tmp_id, p2_distance,
                p3_name, p3_role, p3_tmp_id, p3_distance,
                published
            });
        } else {
            achievement = await Achievement.create({
                month,
                winner_name, winner_role, winner_tmp_id, winner_event_id, winner_dlc,
                p1_name, p1_role, p1_tmp_id, p1_distance,
                p2_name, p2_role, p2_tmp_id, p2_distance,
                p3_name, p3_role, p3_tmp_id, p3_distance,
                published
            });
        }

        res.json({ message: 'Achievement updated successfully', achievement });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;

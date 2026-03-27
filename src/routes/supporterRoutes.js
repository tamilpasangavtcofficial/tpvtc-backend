const express = require('express');
const { Supporter } = require('../models');
const { auth, adminOnly } = require('../middleware/auth');
const router = express.Router();

// Get All Supporters (Public)
router.get('/', async (req, res) => {
    try {
        const supporters = await Supporter.findAll({
            attributes: ['id', 'name', 'truckersmp_id', 'evidence', 'created_at'],
            order: [['created_at', 'DESC']]
        });
        res.json(supporters);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch supporters' });
    }
});

// Get All Supporters with Amount (Admin Only)
router.get('/admin', auth, adminOnly, async (req, res) => {
    try {
        const supporters = await Supporter.findAll({
            order: [['created_at', 'DESC']]
        });
        res.json(supporters);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch supporter data' });
    }
});

// Add Supporter
router.post('/', auth, adminOnly, async (req, res) => {
    try {
        const { name, truckersmp_id, amount, evidence } = req.body;
        const supporter = await Supporter.create({ name, truckersmp_id, amount, evidence });
        res.status(201).json(supporter);
    } catch (err) {
        res.status(500).json({ error: 'Failed to record supporter' });
    }
});

// Delete Supporter
router.delete('/:id', auth, adminOnly, async (req, res) => {
    try {
        await Supporter.destroy({ where: { id: req.params.id } });
        res.json({ message: 'Supporter removed' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to remove supporter' });
    }
});

module.exports = router;

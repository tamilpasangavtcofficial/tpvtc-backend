const express = require('express');
const { Partner } = require('../models');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// GET all partners (public)
router.get('/', async (req, res) => {
    try {
        const partners = await Partner.findAll({
            order: [['created_at', 'DESC']]
        });
        res.json(partners);
    } catch (err) {
        console.error('Error fetching partners:', err);
        res.status(500).json({ message: 'Server error fetching partners' });
    }
});

// GET single partner (public)
router.get('/:id', async (req, res) => {
    try {
        const partner = await Partner.findByPk(req.params.id);
        if (!partner) return res.status(404).json({ message: 'Partner not found' });
        res.json(partner);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// POST new partner (admin only)
router.post('/', auth, adminOnly, async (req, res) => {
    try {
        const { name, vtc_link, partner_type, description, image_url } = req.body;
        const partner = await Partner.create({
            name,
            vtc_link,
            partner_type,
            description,
            image_url
        });
        res.status(201).json(partner);
    } catch (err) {
        console.error('Error creating partner:', err);
        res.status(500).json({ message: 'Server error creating partner' });
    }
});

// PUT update partner (admin only)
router.put('/:id', auth, adminOnly, async (req, res) => {
    try {
        const { name, vtc_link, partner_type, description, image_url } = req.body;
        const partner = await Partner.findByPk(req.params.id);
        
        if (!partner) return res.status(404).json({ message: 'Partner not found' });
        
        await partner.update({
            name,
            vtc_link,
            partner_type,
            description,
            image_url
        });
        
        res.json(partner);
    } catch (err) {
        console.error('Error updating partner:', err);
        res.status(500).json({ message: 'Server error updating partner' });
    }
});

// DELETE partner (admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
    try {
        const partner = await Partner.findByPk(req.params.id);
        if (!partner) return res.status(404).json({ message: 'Partner not found' });
        
        await partner.destroy();
        res.json({ message: 'Partner deleted successfully' });
    } catch (err) {
        console.error('Error deleting partner:', err);
        res.status(500).json({ message: 'Server error deleting partner' });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { Magazine, MagazineNews } = require('../models');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Public: Get all published magazines
router.get('/', async (req, res) => {
    try {
        const magazines = await Magazine.findAll({
            where: { published: true },
            order: [['createdAt', 'DESC']],
            include: [{ model: MagazineNews, as: 'news' }]
        });
        res.json(magazines);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching magazines' });
    }
});

// Admin: Get all magazines (published and unpublished)
router.get('/admin', verifyToken, isAdmin, async (req, res) => {
    try {
        const magazines = await Magazine.findAll({
            order: [['createdAt', 'DESC']],
            include: [{ model: MagazineNews, as: 'news' }]
        });
        res.json(magazines);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching magazines' });
    }
});

// Public: Get a specific published magazine by ID
router.get('/:id', async (req, res) => {
    try {
        const magazine = await Magazine.findOne({
            where: { id: req.params.id, published: true },
            include: [{ model: MagazineNews, as: 'news' }]
        });
        if (!magazine) return res.status(404).json({ error: 'Magazine not found' });
        
        // Sort news by order_index
        magazine.news.sort((a, b) => a.order_index - b.order_index);
        
        res.json(magazine);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching magazine' });
    }
});

// Admin: Get a specific magazine by ID
router.get('/admin/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const magazine = await Magazine.findOne({
            where: { id: req.params.id },
            include: [{ model: MagazineNews, as: 'news' }]
        });
        if (!magazine) return res.status(404).json({ error: 'Magazine not found' });
        
        // Sort news by order_index
        magazine.news.sort((a, b) => a.order_index - b.order_index);
        
        res.json(magazine);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching magazine' });
    }
});

// Admin: Create a new magazine
router.post('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const { month_year, template } = req.body;
        if (!month_year) return res.status(400).json({ error: 'month_year is required' });

        const magazine = await Magazine.create({
            month_year,
            template: template || 'template_1',
            published: false
        });
        res.status(201).json(magazine);
    } catch (err) {
        console.error(err);
        if (err.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'A magazine for this month already exists' });
        }
        res.status(500).json({ error: 'Server error creating magazine' });
    }
});

// Admin: Update a magazine (template, publish status)
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const { month_year, template, published } = req.body;
        const magazine = await Magazine.findByPk(req.params.id);
        if (!magazine) return res.status(404).json({ error: 'Magazine not found' });

        if (month_year !== undefined) magazine.month_year = month_year;
        if (template !== undefined) magazine.template = template;
        if (published !== undefined) magazine.published = published;

        await magazine.save();
        res.json(magazine);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error updating magazine' });
    }
});

// Admin: Delete a magazine
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const magazine = await Magazine.findByPk(req.params.id);
        if (!magazine) return res.status(404).json({ error: 'Magazine not found' });
        await magazine.destroy();
        res.json({ message: 'Magazine deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error deleting magazine' });
    }
});

// Admin: Add news to a magazine
router.post('/:id/news', verifyToken, isAdmin, async (req, res) => {
    try {
        const magazine_id = req.params.id;
        const { topic, sub_topic, content, images, order_index } = req.body;
        
        if (!topic || !content) return res.status(400).json({ error: 'topic and content are required' });

        const magazine = await Magazine.findByPk(magazine_id);
        if (!magazine) return res.status(404).json({ error: 'Magazine not found' });

        const news = await MagazineNews.create({
            magazine_id,
            topic,
            sub_topic,
            content,
            images: images || [],
            order_index: order_index || 0
        });

        res.status(201).json(news);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error adding news' });
    }
});

// Admin: Update news
router.put('/news/:newsId', verifyToken, isAdmin, async (req, res) => {
    try {
        const { topic, sub_topic, content, images, order_index } = req.body;
        const news = await MagazineNews.findByPk(req.params.newsId);
        if (!news) return res.status(404).json({ error: 'News not found' });

        if (topic !== undefined) news.topic = topic;
        if (sub_topic !== undefined) news.sub_topic = sub_topic;
        if (content !== undefined) news.content = content;
        if (images !== undefined) news.images = images;
        if (order_index !== undefined) news.order_index = order_index;

        await news.save();
        res.json(news);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error updating news' });
    }
});

// Admin: Delete news
router.delete('/news/:newsId', verifyToken, isAdmin, async (req, res) => {
    try {
        const news = await MagazineNews.findByPk(req.params.newsId);
        if (!news) return res.status(404).json({ error: 'News not found' });
        
        await news.destroy();
        res.json({ message: 'News deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error deleting news' });
    }
});

module.exports = router;

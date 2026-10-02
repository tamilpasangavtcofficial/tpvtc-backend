const express = require('express');
const { GalleryImage, HeaderImage, Album, AlbumImage } = require('../models');
const { auth, adminOnly } = require('../middleware/auth');
const cloudinary = require('cloudinary').v2;
const router = express.Router();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Generate signature for signed upload
router.post('/upload-sign', auth, adminOnly, (req, res) => {
    try {
        const timestamp = Math.round(new Date().getTime() / 1000);
        const signature = cloudinary.utils.api_sign_request(
            { timestamp, folder: 'tpvtc' },
            process.env.CLOUDINARY_API_SECRET
        );
        res.json({ 
            signature, 
            timestamp, 
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            folder: 'tpvtc'
        });
    } catch (err) {
        res.status(500).json({ message: 'Error signing upload' });
    }
});

// Get Albums
router.get('/albums', async (req, res) => {
    try {
        const albums = await Album.findAll({
            include: [{ model: AlbumImage, as: 'images' }],
            order: [['createdAt', 'DESC']]
        });
        res.json(albums);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Specific Album with Images
router.get('/albums/:id', async (req, res) => {
    try {
        const album = await Album.findByPk(req.params.id, {
            include: [{ model: AlbumImage, as: 'images' }]
        });
        if (!album) return res.status(404).json({ message: 'Album not found' });
        res.json(album);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Gallery (can filter by album_id)
router.get('/gallery', async (req, res) => {
    try {
        const where = {};
        if (req.query.album_id) {
            where.album_id = req.query.album_id;
        }
        const images = await GalleryImage.findAll({ where });
        res.json(images);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Header Images
router.get('/headers', async (req, res) => {
    try {
        const images = await HeaderImage.findAll();
        res.json(images);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// (Admin) Add Album
router.post('/albums', auth, adminOnly, async (req, res) => {
    try {
        const { title, cover_image_url } = req.body;
        const album = await Album.create({ title, cover_image_url });
        res.status(201).json(album);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// (Admin) Update Album
router.put('/albums/:id', auth, adminOnly, async (req, res) => {
    try {
        const { title, cover_image_url } = req.body;
        const album = await Album.findByPk(req.params.id);
        if (!album) return res.status(404).json({ message: 'Album not found' });
        await album.update({ title, cover_image_url });
        res.json(album);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// (Admin) Delete Album
router.delete('/albums/:id', auth, adminOnly, async (req, res) => {
    try {
        const album = await Album.findByPk(req.params.id);
        if (!album) return res.status(404).json({ message: 'Album not found' });
        
        // Let Sequelize handle cascade delete of images if configured, or we can just delete the album row.
        // It's a simple implementation for now.
        await album.destroy();
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// (Admin) Add Gallery Image (original, untouched)
router.post('/gallery', auth, adminOnly, async (req, res) => {
    try {
        const { image_url } = req.body;
        const image = await GalleryImage.create({ image_url });
        res.status(201).json(image);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// (Admin) Add Gallery Image to an Album
router.post('/album-images', auth, adminOnly, async (req, res) => {
    try {
        const { image_url, album_id } = req.body;
        const image = await AlbumImage.create({ image_url, album_id });
        res.status(201).json(image);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// (Admin) Delete Album Image
router.delete('/album-images/:id', auth, adminOnly, async (req, res) => {
    try {
        const image = await AlbumImage.findByPk(req.params.id);
        if (!image) return res.status(404).json({ message: 'Image not found' });
        const parts = image.image_url.split('/upload/');
        if (parts.length === 2) {
            const pathStr = parts[1].replace(/^v\d+\//, '');
            const publicId = pathStr.replace(/\.[^/.]+$/, '');
            await cloudinary.uploader.destroy(publicId);
        }
        await image.destroy();
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// (Admin) Add Header Image
router.post('/headers', auth, adminOnly, async (req, res) => {
    try {
        const { image_url } = req.body;
        const image = await HeaderImage.create({ image_url });
        res.status(201).json(image);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// (Admin) Delete Gallery Image
router.delete('/gallery/:id', auth, adminOnly, async (req, res) => {
    try {
        const image = await GalleryImage.findByPk(req.params.id);
        if (!image) return res.status(404).json({ message: 'Image not found' });
        
        const parts = image.image_url.split('/upload/');
        if (parts.length === 2) {
            const pathStr = parts[1].replace(/^v\d+\//, '');
            const publicId = pathStr.replace(/\.[^/.]+$/, '');
            await cloudinary.uploader.destroy(publicId);
        }

        await image.destroy();
        res.json({ message: 'Deleted from database and Cloudinary' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// (Admin) Delete Header Image
router.delete('/headers/:id', auth, adminOnly, async (req, res) => {
    try {
        const image = await HeaderImage.findByPk(req.params.id);
        if (!image) return res.status(404).json({ message: 'Image not found' });

        const parts = image.image_url.split('/upload/');
        if (parts.length === 2) {
            const pathStr = parts[1].replace(/^v\d+\//, '');
            const publicId = pathStr.replace(/\.[^/.]+$/, '');
            await cloudinary.uploader.destroy(publicId);
        }

        await image.destroy();
        res.json({ message: 'Deleted from database and Cloudinary' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

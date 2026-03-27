const express = require('express');
const { GalleryImage, HeaderImage } = require('../models');
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

// Get Gallery
router.get('/gallery', async (req, res) => {
    try {
        const images = await GalleryImage.findAll();
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

// (Admin) Add Gallery Image
router.post('/gallery', auth, adminOnly, async (req, res) => {
    try {
        const { image_url } = req.body;
        const image = await GalleryImage.create({ image_url });
        res.status(201).json(image);
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

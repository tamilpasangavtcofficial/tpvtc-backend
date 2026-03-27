const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const GalleryImage = sequelize.define('GalleryImage', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    image_url: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

module.exports = GalleryImage;

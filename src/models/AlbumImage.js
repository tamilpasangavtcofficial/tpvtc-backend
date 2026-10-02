const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const AlbumImage = sequelize.define('AlbumImage', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    album_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    image_url: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

module.exports = AlbumImage;

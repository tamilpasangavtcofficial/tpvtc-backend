const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Album = sequelize.define('Album', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    cover_image_url: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

module.exports = Album;

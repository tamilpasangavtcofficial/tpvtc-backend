const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const MagazineNews = sequelize.define('MagazineNews', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    magazine_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Magazines', // Sequelize standard table name
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    topic: {
        type: DataTypes.STRING,
        allowNull: false
    },
    sub_topic: {
        type: DataTypes.STRING,
        allowNull: true
    },
    content: {
        type: DataTypes.TEXT('long'),
        allowNull: false
    },
    images: {
        type: DataTypes.JSON, // Array of image URLs
        allowNull: true,
        defaultValue: []
    },
    order_index: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
}, {
    timestamps: true
});

module.exports = MagazineNews;

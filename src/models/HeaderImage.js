const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const HeaderImage = sequelize.define('HeaderImage', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    image_url: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    timestamps: false
});

module.exports = HeaderImage;

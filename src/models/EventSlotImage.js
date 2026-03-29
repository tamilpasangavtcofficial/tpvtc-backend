const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const EventSlotImage = sequelize.define('EventSlotImage', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    event_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    slot_url: {
        type: DataTypes.STRING,
        allowNull: false
    },
    total_slots: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    slot_name: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

module.exports = EventSlotImage;

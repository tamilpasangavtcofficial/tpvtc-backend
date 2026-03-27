const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const EventSlot = sequelize.define('EventSlot', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    slot_no: {
        type: DataTypes.STRING,
        allowNull: false
    },
    booked_by: {
        type: DataTypes.STRING,
        allowNull: true
    },
    event_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    slot_image_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    timestamps: true
});

module.exports = EventSlot;


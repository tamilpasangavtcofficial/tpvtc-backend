const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const AttendingEventSlot = sequelize.define('AttendingEventSlot', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    event_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
    },
    slot_url: {
        type: DataTypes.STRING,
        allowNull: false
    },
    slot_number: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

module.exports = AttendingEventSlot;

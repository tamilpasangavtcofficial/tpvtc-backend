const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const BookingRequest = sequelize.define('BookingRequest', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    vtc_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    vtc_tag: {
        type: DataTypes.STRING,
        allowNull: true
    },
    vtc_member_count: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    discord_username: {
        type: DataTypes.STRING,
        allowNull: true
    },
    vtc_role: {
        type: DataTypes.STRING,
        allowNull: true
    },
    vtc_link: {
        type: DataTypes.STRING,
        allowNull: true
    },
    event_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    event_slot_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending'
    },
    processed_by: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

module.exports = BookingRequest;

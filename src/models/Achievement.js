const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Achievement = sequelize.define('Achievement', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    month: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: () => {
            const now = new Date();
            const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            return `${months[now.getMonth()]} ${now.getFullYear()}`;
        }
    },
    // Giveaway Info
    winner_name: { type: DataTypes.STRING, allowNull: false },
    winner_role: { type: DataTypes.STRING, allowNull: false },
    winner_tmp_id: { type: DataTypes.INTEGER, allowNull: true },
    winner_event_id: { type: DataTypes.INTEGER, allowNull: false },
    winner_dlc: { type: DataTypes.STRING, allowNull: false },
    // Top 1
    p1_name: { type: DataTypes.STRING, allowNull: false },
    p1_role: { type: DataTypes.STRING, allowNull: false },
    p1_tmp_id: { type: DataTypes.INTEGER, allowNull: true },
    p1_distance: { type: DataTypes.STRING, allowNull: false },
    // Top 2
    p2_name: { type: DataTypes.STRING, allowNull: false },
    p2_role: { type: DataTypes.STRING, allowNull: false },
    p2_tmp_id: { type: DataTypes.INTEGER, allowNull: true },
    p2_distance: { type: DataTypes.STRING, allowNull: false },
    // Top 3
    p3_name: { type: DataTypes.STRING, allowNull: false },
    p3_role: { type: DataTypes.STRING, allowNull: false },
    p3_tmp_id: { type: DataTypes.INTEGER, allowNull: true },
    p3_distance: { type: DataTypes.STRING, allowNull: false },
    published: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    timestamps: true
});

module.exports = Achievement;

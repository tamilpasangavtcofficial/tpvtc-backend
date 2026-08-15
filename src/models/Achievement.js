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
    // Giveaway Info (Deprecated/Optional)
    winner_name: { type: DataTypes.STRING, allowNull: true },
    winner_role: { type: DataTypes.STRING, allowNull: true },
    winner_tmp_id: { type: DataTypes.INTEGER, allowNull: true },
    winner_event_id: { type: DataTypes.INTEGER, allowNull: true },
    winner_dlc: { type: DataTypes.STRING, allowNull: true },
    // Top 1
    p1_name: { type: DataTypes.STRING, allowNull: false },
    p1_role: { type: DataTypes.STRING, allowNull: false },
    p1_tmp_id: { type: DataTypes.INTEGER, allowNull: true },
    p1_distance: { type: DataTypes.STRING, allowNull: false },
    p1_dlc: { type: DataTypes.STRING, allowNull: true },
    // Top 2
    p2_name: { type: DataTypes.STRING, allowNull: false },
    p2_role: { type: DataTypes.STRING, allowNull: false },
    p2_tmp_id: { type: DataTypes.INTEGER, allowNull: true },
    p2_distance: { type: DataTypes.STRING, allowNull: false },
    p2_dlc: { type: DataTypes.STRING, allowNull: true },
    // Top 3
    p3_name: { type: DataTypes.STRING, allowNull: false },
    p3_role: { type: DataTypes.STRING, allowNull: false },
    p3_tmp_id: { type: DataTypes.INTEGER, allowNull: true },
    p3_distance: { type: DataTypes.STRING, allowNull: false },
    p3_dlc: { type: DataTypes.STRING, allowNull: true },
    published: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    timestamps: true
});

module.exports = Achievement;

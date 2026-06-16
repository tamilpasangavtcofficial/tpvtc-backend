const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Magazine = sequelize.define('Magazine', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    month_year: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    template: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'template_1'
    },
    published: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    timestamps: true
});

module.exports = Magazine;

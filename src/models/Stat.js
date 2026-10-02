const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Stat = sequelize.define('Stat', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  key: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  data: {
    type: DataTypes.JSON,
    allowNull: false
  },
  lastSync: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'stats',
  timestamps: true
});

module.exports = Stat;

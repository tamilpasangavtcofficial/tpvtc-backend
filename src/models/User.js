const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const UserRole = require('./UserRole');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    last_login_at: {
        type: DataTypes.DATE
    }
});

User.belongsTo(UserRole, { foreignKey: 'role_id' });
UserRole.hasMany(User, { foreignKey: 'role_id' });

module.exports = User;

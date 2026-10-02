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
    steam_id: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    tmp_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: true
    },
    avatar_url: {
        type: DataTypes.STRING,
        allowNull: true
    },
    last_login_at: {
        type: DataTypes.DATE
    }
});

User.belongsTo(UserRole, { foreignKey: 'role_id' });
UserRole.hasMany(User, { foreignKey: 'role_id' });

module.exports = User;

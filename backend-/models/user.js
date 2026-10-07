const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(254), unique: true, allowNull: false, validate: { isEmail: true } },
    passwordHash: { type: DataTypes.STRING(255), allowNull: true },
    major: { type: DataTypes.STRING(150), allowNull: false },
    academicYear: { type: DataTypes.INTEGER, allowNull: true, validate: { min: 1, max: 8 } }
});

module.exports = User;
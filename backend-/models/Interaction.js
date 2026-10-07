const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Interaction = sequelize.define('Interaction', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    bookId: { type: DataTypes.INTEGER, allowNull: false },
    type: { type: DataTypes.ENUM('VIEW', 'DOWNLOAD', 'FAVORITE', 'EXCHANGE'), allowNull: false },
    weight: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 1.0 }
});

module.exports = Interaction;
const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Recommendation = sequelize.define('Recommendation', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    bookId: { type: DataTypes.INTEGER, allowNull: false },
    score: { type: DataTypes.FLOAT, defaultValue: 0.0 }
});

module.exports = Recommendation;
const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Book = sequelize.define('Book', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING(200), allowNull: false },
    subject: { type: DataTypes.STRING(150), allowNull: false },
    major: { type: DataTypes.STRING(150), allowNull: false },
    fileUrl: { type: DataTypes.STRING(2048), allowNull: true, validate: { isUrl: true } }
});

module.exports = Book;
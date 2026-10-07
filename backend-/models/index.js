const sequelize = require('../config/sequelize');
const User = require('./user');
const Book = require('./Books');
const Interaction = require('./Interaction');
const Recommendation = require('./Recommendation');

User.hasMany(Interaction, { foreignKey: 'userId', onDelete: 'CASCADE' });
Interaction.belongsTo(User, { foreignKey: 'userId' });
Book.hasMany(Interaction, { foreignKey: 'bookId', onDelete: 'CASCADE' });
Interaction.belongsTo(Book, { foreignKey: 'bookId' });
User.belongsToMany(Book, { through: Recommendation, foreignKey: 'userId', otherKey: 'bookId' });
Book.belongsToMany(User, { through: Recommendation, foreignKey: 'bookId', otherKey: 'userId' });

module.exports = { sequelize, User, Book, Interaction, Recommendation };
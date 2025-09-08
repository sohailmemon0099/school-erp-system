const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Book = sequelize.define('Book', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  author: {
    type: DataTypes.STRING,
    allowNull: false
  },
  isbn: {
    type: DataTypes.STRING,
    unique: true
  },
  publisher: {
    type: DataTypes.STRING
  },
  publicationYear: {
    type: DataTypes.INTEGER
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  subcategory: {
    type: DataTypes.STRING
  },
  language: {
    type: DataTypes.STRING,
    defaultValue: 'English'
  },
  pages: {
    type: DataTypes.INTEGER
  },
  description: {
    type: DataTypes.TEXT
  },
  coverImage: {
    type: DataTypes.STRING
  },
  totalCopies: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  availableCopies: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  shelfLocation: {
    type: DataTypes.STRING
  },
  price: {
    type: DataTypes.DECIMAL(10, 2)
  },
  purchaseDate: {
    type: DataTypes.DATE
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

module.exports = Book;

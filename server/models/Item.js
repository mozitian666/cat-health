const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Item = sequelize.define('Item', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('food', 'toy', 'decoration'),
    allowNull: false
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  effectType: {
    type: DataTypes.STRING, // 'energy', 'exp', 'appearance'
    allowNull: true
  },
  effectValue: {
    type: DataTypes.STRING, // For appearance, this could be a class name or emoji
    allowNull: true
  },
  icon: {
    type: DataTypes.STRING, // Emoji or image url
    defaultValue: '📦'
  }
});

module.exports = Item;
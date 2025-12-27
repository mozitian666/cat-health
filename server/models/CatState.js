const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CatState = sequelize.define('CatState', {
  name: {
    type: DataTypes.STRING,
    defaultValue: '小白'
  },
  level: {
    type: DataTypes.INTEGER,
    defaultValue: 1 // 1: Kitten, 2: Adult, 3: Senior
  },
  weight: {
    type: DataTypes.FLOAT,
    defaultValue: 1.0 // kg
  },
  furQuality: {
    type: DataTypes.INTEGER,
    defaultValue: 80 // 0-100
  },
  energy: {
    type: DataTypes.INTEGER,
    defaultValue: 60 // 0-100, default 60 to allow growth
  },
  exp: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  waterCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
});

module.exports = CatState;

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DietRecord = sequelize.define('DietRecord', {
  imagePath: {
    type: DataTypes.STRING,
    allowNull: true
  },
  foodName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  calories: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  protein: {
    type: DataTypes.FLOAT, // grams
    defaultValue: 0
  },
  carbs: {
    type: DataTypes.FLOAT, // grams
    defaultValue: 0
  },
  fat: {
    type: DataTypes.FLOAT, // grams
    defaultValue: 0
  },
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

module.exports = DietRecord;

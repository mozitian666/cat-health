const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const QuestLog = sequelize.define('QuestLog', {
  questId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  date: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW
  }
});

module.exports = QuestLog;
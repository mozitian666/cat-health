const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Inventory = sequelize.define('Inventory', {
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  isEquipped: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

module.exports = Inventory;
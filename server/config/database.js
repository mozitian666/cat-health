const { Sequelize } = require('sequelize');
const path = require('path');

// Use SQLite for development simplicity, easy to switch to MySQL later
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: ':memory:', // Use in-memory database to avoid file permission/lock issues
  logging: false
});

module.exports = sequelize;

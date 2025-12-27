const sequelize = require('../config/database');
const User = require('./User');
const DietRecord = require('./DietRecord');
const CatState = require('./CatState');

// Associations
User.hasMany(DietRecord);
DietRecord.belongsTo(User);

User.hasOne(CatState);
CatState.belongsTo(User);

module.exports = {
  sequelize,
  User,
  DietRecord,
  CatState
};

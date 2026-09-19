const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SodaFlavor = sequelize.define('SodaFlavor', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

module.exports = SodaFlavor;

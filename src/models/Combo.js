const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const PizzaFlavor = require('./PizzaFlavor');

const Combo = sequelize.define('Combo', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  totalQuantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  remainingQuantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  availableUntil: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      return tomorrow;
    },
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

// Associations
Combo.belongsTo(PizzaFlavor, { foreignKey: 'pizzaFlavorId', as: 'pizzaFlavor' });

module.exports = Combo;

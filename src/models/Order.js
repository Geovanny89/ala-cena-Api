const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Combo = require('./Combo');
const SodaFlavor = require('./SodaFlavor');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  customerName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  studentId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  whatsapp: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: { min: 1 },
  },
  sodaSize: {
    type: DataTypes.ENUM('7oz', '12oz'),
    allowNull: false,
  },
  sodaFlavorId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'delivered', 'cancelled'),
    defaultValue: 'pending',
  },
  orderCode: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  receiptUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

// Associations
Order.belongsTo(Combo, { foreignKey: 'comboId', as: 'combo' });
Order.belongsTo(SodaFlavor, { foreignKey: 'sodaFlavorId', as: 'chosenSodaFlavor' });

module.exports = Order;

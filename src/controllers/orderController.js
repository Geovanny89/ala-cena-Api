const Order = require('../models/Order');
const Combo = require('../models/Combo');
const PizzaFlavor = require('../models/PizzaFlavor');
const SodaFlavor = require('../models/SodaFlavor');
const sequelize = require('../config/database');
const { Op } = require('sequelize');

// GET /api/orders (admin)
const getAll = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        {
          model: Combo,
          as: 'combo',
          include: [
            { model: PizzaFlavor, as: 'pizzaFlavor' },
          ],
        },
        { model: SodaFlavor, as: 'chosenSodaFlavor' },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json({ orders });
  } catch (err) {
    console.error('Error en getAll Orders:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const SODA_PRICES = { '7oz': 5000, '12oz': 7000 };

// POST /api/orders (público - clientes)
const create = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { comboId, customerName, studentId, whatsapp, sodaSize, sodaFlavorId, quantity = 1 } = req.body;
    
    // Comprobante opcional al crear
    const receiptUrl = req.file ? `/uploads/receipts/${req.file.filename}` : null;

    const now = new Date();
    if (now.getHours() === 9) {
      await t.rollback();
      return res.status(400).json({ message: 'El sistema de pedidos está cerrado de 9:00 AM a 10:00 AM.' });
    }

    if (!comboId || !customerName || !studentId || !whatsapp || !sodaSize || !sodaFlavorId) {
      await t.rollback();
      return res.status(400).json({ message: 'Todos los campos son requeridos (incluyendo sabor de gaseosa)' });
    }

    if (!['7oz', '12oz'].includes(sodaSize)) {
      await t.rollback();
      return res.status(400).json({ message: 'Tamaño de gaseosa inválido' });
    }

    // Validar que el sabor de gaseosa existe
    const sodaFlavor = await SodaFlavor.findByPk(sodaFlavorId, { transaction: t });
    if (!sodaFlavor) {
      await t.rollback();
      return res.status(404).json({ message: 'Sabor de gaseosa no encontrado' });
    }

    const combo = await Combo.findByPk(comboId, { transaction: t });
    if (!combo) {
      await t.rollback();
      return res.status(404).json({ message: 'Combo no encontrado' });
    }

    if (!combo.isActive) {
      await t.rollback();
      return res.status(400).json({ message: 'Este combo ya no está disponible' });
    }

    if (combo.remainingQuantity < quantity) {
      await t.rollback();
      return res.status(400).json({
        message: `Solo quedan ${combo.remainingQuantity} unidades disponibles`,
      });
    }

    // Descontar inventario
    await combo.update(
      { remainingQuantity: combo.remainingQuantity - quantity },
      { transaction: t }
    );

    const pricePerUnit = SODA_PRICES[sodaSize];
    const totalPrice = pricePerUnit * quantity;
    
    // Generar código único (AC- + 5 caracteres aleatorios)
    const orderCode = 'AC-' + Math.random().toString(36).substring(2, 7).toUpperCase();

    const order = await Order.create(
      { comboId, customerName, studentId, whatsapp, quantity, sodaSize, sodaFlavorId, totalPrice, orderCode, receiptUrl },
      { transaction: t }
    );

    await t.commit();

    const result = await Order.findByPk(order.id, {
      include: [
        {
          model: Combo,
          as: 'combo',
          include: [
            { model: PizzaFlavor, as: 'pizzaFlavor' },
          ],
        },
        { model: SodaFlavor, as: 'chosenSodaFlavor' },
      ],
    });

    res.status(201).json({ message: 'Pedido realizado con éxito', order: result });
  } catch (err) {
    await t.rollback();
    console.error('Error en create Order:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const fs = require('fs');
const path = require('path');

// PATCH /api/orders/:id/status (admin)
const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Estado inválido' });
    }

    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ message: 'Pedido no encontrado' });

    // Si se cancela, devolver al inventario
    if (status === 'cancelled' && order.status !== 'cancelled') {
      const combo = await Combo.findByPk(order.comboId);
      if (combo) {
        await combo.update({ remainingQuantity: combo.remainingQuantity + order.quantity });
      }
    }

    // Si se entrega o cancela, borrar la imagen del comprobante para ahorrar espacio
    if ((status === 'delivered' || status === 'cancelled') && order.receiptUrl) {
      const filePath = path.join(__dirname, '../../', order.receiptUrl);
      fs.unlink(filePath, (err) => {
        if (err && err.code !== 'ENOENT') {
          console.error('Error al borrar el comprobante:', err);
        }
      });
      // Opcional: Quitar la referencia en la BD
      await order.update({ status, receiptUrl: null });
    } else {
      await order.update({ status });
    }

    res.json({ message: 'Estado actualizado', order });
  } catch (err) {
    console.error('Error en updateStatus Order:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// PATCH /api/orders/:id/receipt (público - cliente sube comprobante)
const uploadReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.file) {
      return res.status(400).json({ message: 'El comprobante de pago es requerido' });
    }

    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ message: 'Pedido no encontrado' });

    // Si ya tenía comprobante anterior, borrarlo
    if (order.receiptUrl) {
      const oldPath = path.join(__dirname, '../../', order.receiptUrl);
      fs.unlink(oldPath, (err) => {
        if (err && err.code !== 'ENOENT') console.error('Error al borrar comprobante anterior:', err);
      });
    }

    const receiptUrl = `/uploads/receipts/${req.file.filename}`;
    await order.update({ receiptUrl });

    res.json({ message: 'Comprobante subido con éxito', receiptUrl });
  } catch (err) {
    console.error('Error en uploadReceipt:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// GET /api/orders/metrics (admin)
const getMetrics = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Ventas de hoy (solo confirmadas o entregadas)
    const todayOrders = await Order.findAll({
      where: {
        createdAt: {
          [Op.gte]: today,
          [Op.lt]: tomorrow,
        },
        status: {
          [Op.in]: ['confirmed', 'delivered'],
        },
      },
    });

    const todaySales = todayOrders.reduce((sum, order) => sum + parseFloat(order.totalPrice), 0);
    const todayCount = todayOrders.length;

    // Clientes (agrupados por whatsapp)
    const customersRaw = await Order.findAll({
      attributes: [
        'customerName',
        'whatsapp',
        'studentId',
        [sequelize.fn('COUNT', sequelize.col('id')), 'ordersCount'],
        [sequelize.fn('SUM', sequelize.col('totalPrice')), 'totalSpent'],
      ],
      where: {
        status: {
          [Op.in]: ['confirmed', 'delivered'],
        },
      },
      group: ['whatsapp', 'customerName', 'studentId'],
      order: [[sequelize.literal('"totalSpent"'), 'DESC']],
      raw: true,
    });

    res.json({
      todaySales,
      todayCount,
      customers: customersRaw,
    });
  } catch (err) {
    console.error('Error en getMetrics:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = { getAll, create, updateStatus, uploadReceipt, getMetrics };

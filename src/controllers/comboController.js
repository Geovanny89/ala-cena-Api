const Combo = require('../models/Combo');
const PizzaFlavor = require('../models/PizzaFlavor');
const { Op } = require('sequelize');

const SODA_PRICES = { '7oz': 5000, '12oz': 7000 };

// GET /api/combos - lista combos disponibles (remainingQuantity > 0)
const getAll = async (req, res) => {
  try {
    const { all } = req.query; // admin puede pedir todos
    const where = {};
    if (!all || all !== 'true') {
      where.isActive = true;
    }

    const combos = await Combo.findAll({
      where,
      include: [
        { model: PizzaFlavor, as: 'pizzaFlavor' },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json({ combos });
  } catch (err) {
    console.error('Error en getAll Combo:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// GET /api/combos/:id
const getOne = async (req, res) => {
  try {
    const combo = await Combo.findByPk(req.params.id, {
      include: [
        { model: PizzaFlavor, as: 'pizzaFlavor' },
      ],
    });
    if (!combo) return res.status(404).json({ message: 'Combo no encontrado' });
    res.json({ combo });
  } catch (err) {
    console.error('Error en getOne Combo:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// POST /api/combos (admin)
const create = async (req, res) => {
  try {
    const { pizzaFlavorId, totalQuantity } = req.body;

    if (!pizzaFlavorId || totalQuantity === undefined) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    const pizzaFlavor = await PizzaFlavor.findByPk(pizzaFlavorId);
    if (!pizzaFlavor) return res.status(404).json({ message: 'Sabor de pizza no encontrado' });

    const combo = await Combo.create({
      pizzaFlavorId,
      totalQuantity: parseInt(totalQuantity),
      remainingQuantity: parseInt(totalQuantity),
    });

    const result = await Combo.findByPk(combo.id, {
      include: [
        { model: PizzaFlavor, as: 'pizzaFlavor' },
      ],
    });

    res.status(201).json({ message: 'Combo creado correctamente', combo: result });
  } catch (err) {
    console.error('Error en create Combo:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// PUT /api/combos/:id (admin)
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { pizzaFlavorId, totalQuantity, isActive } = req.body;

    const combo = await Combo.findByPk(id);
    if (!combo) return res.status(404).json({ message: 'Combo no encontrado' });

    const updateData = {};
    if (pizzaFlavorId) updateData.pizzaFlavorId = pizzaFlavorId;
    if (isActive !== undefined) updateData.isActive = isActive;

    if (totalQuantity !== undefined) {
      const diff = parseInt(totalQuantity) - combo.totalQuantity;
      updateData.totalQuantity = parseInt(totalQuantity);
      updateData.remainingQuantity = Math.max(0, combo.remainingQuantity + diff);
    }

    await combo.update(updateData);

    const result = await Combo.findByPk(id, {
      include: [
        { model: PizzaFlavor, as: 'pizzaFlavor' },
      ],
    });

    res.json({ message: 'Combo actualizado', combo: result });
  } catch (err) {
    console.error('Error en update Combo:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// DELETE /api/combos/:id (admin)
const remove = async (req, res) => {
  try {
    const combo = await Combo.findByPk(req.params.id);
    if (!combo) return res.status(404).json({ message: 'Combo no encontrado' });

    await combo.destroy();
    res.json({ message: 'Combo eliminado correctamente' });
  } catch (err) {
    console.error('Error en remove Combo:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = { getAll, getOne, create, update, remove };

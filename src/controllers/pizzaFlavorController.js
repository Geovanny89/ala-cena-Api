const PizzaFlavor = require('../models/PizzaFlavor');

// GET /api/pizza-flavors
const getAll = async (req, res) => {
  try {
    const flavors = await PizzaFlavor.findAll({ order: [['name', 'ASC']] });
    res.json({ flavors });
  } catch (err) {
    console.error('Error en getAll PizzaFlavor:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// POST /api/pizza-flavors
const create = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'El nombre es requerido' });

    const existing = await PizzaFlavor.findOne({ where: { name } });
    if (existing) return res.status(409).json({ message: 'Ya existe un sabor con ese nombre' });

    const flavor = await PizzaFlavor.create({ name, description });
    res.status(201).json({ message: 'Sabor de pizza creado', flavor });
  } catch (err) {
    console.error('Error en create PizzaFlavor:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// PUT /api/pizza-flavors/:id
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;

    const flavor = await PizzaFlavor.findByPk(id);
    if (!flavor) return res.status(404).json({ message: 'Sabor no encontrado' });

    await flavor.update({ name, description, isActive });
    res.json({ message: 'Sabor actualizado', flavor });
  } catch (err) {
    console.error('Error en update PizzaFlavor:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// DELETE /api/pizza-flavors/:id
const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const flavor = await PizzaFlavor.findByPk(id);
    if (!flavor) return res.status(404).json({ message: 'Sabor no encontrado' });

    await flavor.destroy();
    res.json({ message: 'Sabor eliminado correctamente' });
  } catch (err) {
    console.error('Error en remove PizzaFlavor:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = { getAll, create, update, remove };

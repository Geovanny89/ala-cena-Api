const SodaFlavor = require('../models/SodaFlavor');

// GET /api/soda-flavors
const getAll = async (req, res) => {
  try {
    const flavors = await SodaFlavor.findAll({ order: [['name', 'ASC']] });
    res.json({ flavors });
  } catch (err) {
    console.error('Error en getAll SodaFlavor:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// POST /api/soda-flavors
const create = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'El nombre es requerido' });

    const existing = await SodaFlavor.findOne({ where: { name } });
    if (existing) return res.status(409).json({ message: 'Ya existe un sabor con ese nombre' });

    const flavor = await SodaFlavor.create({ name });
    res.status(201).json({ message: 'Sabor de gaseosa creado', flavor });
  } catch (err) {
    console.error('Error en create SodaFlavor:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// PUT /api/soda-flavors/:id
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, isActive } = req.body;

    const flavor = await SodaFlavor.findByPk(id);
    if (!flavor) return res.status(404).json({ message: 'Sabor no encontrado' });

    await flavor.update({ name, isActive });
    res.json({ message: 'Sabor actualizado', flavor });
  } catch (err) {
    console.error('Error en update SodaFlavor:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// DELETE /api/soda-flavors/:id
const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const flavor = await SodaFlavor.findByPk(id);
    if (!flavor) return res.status(404).json({ message: 'Sabor no encontrado' });

    await flavor.destroy();
    res.json({ message: 'Sabor eliminado correctamente' });
  } catch (err) {
    console.error('Error en remove SodaFlavor:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = { getAll, create, update, remove };

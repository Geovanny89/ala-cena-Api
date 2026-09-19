const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const pizzaFlavorRoutes = require('./routes/pizzaFlavorRoutes');
const sodaFlavorRoutes = require('./routes/sodaFlavorRoutes');
const comboRoutes = require('./routes/comboRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

// Middlewares globales
app.use(cors({
  origin: 'https://onrender.com',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/pizza-flavors', pizzaFlavorRoutes);
app.use('/api/soda-flavors', sodaFlavorRoutes);
app.use('/api/combos', comboRoutes);
app.use('/api/orders', orderRoutes);

// Archivos estáticos
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Ala-Cena API corriendo correctamente 🍕' });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Manejo de errores globales
app.use((err, req, res, next) => {
  console.error('Error global:', err);
  res.status(500).json({ message: 'Error interno del servidor' });
});

module.exports = app;

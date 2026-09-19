require('dotenv').config();
const app = require('./src/app');
const sequelize = require('./src/config/database');
const { port, admin } = require('./src/config/env');
const bcrypt = require('bcryptjs');

// Importar todos los modelos para que Sequelize los registre
const User = require('./src/models/User');
const PizzaFlavor = require('./src/models/PizzaFlavor');
const SodaFlavor = require('./src/models/SodaFlavor');
const Combo = require('./src/models/Combo');
const Order = require('./src/models/Order');

const seedAdmin = async () => {
  try {
    const existing = await User.findOne({ where: { email: admin.email } });
    if (!existing) {
      const hashed = await bcrypt.hash(admin.password, 10);
      await User.create({
        name: admin.name,
        email: admin.email,
        password: hashed,
        role: 'admin',
      });
      console.log(`✅ Admin creado: ${admin.email} / ${admin.password}`);
    } else {
      console.log(`ℹ️  Admin ya existe: ${admin.email}`);
    }
  } catch (err) {
    console.error('Error al crear admin:', err);
  }
};

const startServer = async () => {
  try {
    // Sincronizar la base de datos (crear tablas si no existen)
    await sequelize.sync({ force: false });
    console.log('✅ Base de datos sincronizada');

    // Crear admin por defecto
    await seedAdmin();

    app.listen(port, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
      console.log(`📖 Health check: http://localhost:${port}/api/health`);
    });
  } catch (err) {
    console.error('❌ Error al iniciar el servidor:', err);
    process.exit(1);
  }
};

startServer();

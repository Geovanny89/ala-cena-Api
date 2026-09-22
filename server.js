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
    // Sincronizar la base de datos (alter:true agrega columnas nuevas sin borrar datos)
    await sequelize.sync({ force: true });
    console.log('✅ Base de datos sincronizada');

    // Crear admin por defecto
    await seedAdmin();

    // Configurar reseteo diario de inventario a las 10:00 AM
    let lastResetDate = null;
    setInterval(async () => {
      const now = new Date();
      const currentDate = now.toDateString();
      if (now.getHours() === 10 && lastResetDate !== currentDate) {
        try {
          await Combo.update(
            { remainingQuantity: sequelize.col('totalQuantity') },
            { where: { isActive: true } }
          );
          lastResetDate = currentDate;
          console.log('✅ Combos reseteados correctamente a las 10:00 AM');
        } catch (err) {
          console.error('❌ Error al resetear los combos:', err);
        }
      }
    }, 60000);

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

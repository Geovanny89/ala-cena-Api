const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;

// Si existe DATABASE_URL (entorno de producción como Render), se conecta usando la URL completa
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Requerido por Render para conexiones SSL seguras
      }
    }
  });
} else {
  // Si no existe (entorno local / desarrollo), usa tus variables individuales
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      dialect: 'postgres',
      logging: false,
    }
  );
}

module.exports = sequelize;

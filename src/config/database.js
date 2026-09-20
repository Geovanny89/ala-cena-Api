const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;

// 1. Si estás en Render (donde configuraste DATABASE_URL), usará la URL completa
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Obligatorio para que Render no rechace la conexión segura
      }
    }
  });
} else {
  // 2. Si estás en tu computadora (Localhost), usará tus variables individuales del archivo .env
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      dialect: process.env.DB_DIALECT || 'postgres',
      logging: false,
    }
  );
}

module.exports = sequelize;

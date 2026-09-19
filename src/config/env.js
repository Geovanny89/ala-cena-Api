require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3001,
  jwtSecret: process.env.JWT_SECRET || 'ala_cena_secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  admin: {
    name: process.env.ADMIN_NAME || 'Administrador',
    email: process.env.ADMIN_EMAIL || 'admin@alacena.com',
    password: process.env.ADMIN_PASSWORD || 'Admin1234',
  },
};

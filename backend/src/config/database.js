const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5433, // Using 5433 to avoid conflict with local PostgreSQL
    dialect: 'postgres',
    logging: false,
  }
);

module.exports = sequelize;

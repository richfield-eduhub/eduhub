const { Sequelize } = require('sequelize');
require('dotenv').config();

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 5ab37d8 (WIP)
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || 'localhost',
<<<<<<< HEAD
    port: process.env.DB_PORT || 5433, // Using 5433 to avoid conflict with local PostgreSQL
=======
    port: process.env.DB_PORT || 5432,
>>>>>>> 5ab37d8 (WIP)
    dialect: 'postgres',
    logging: false,
  }
);
<<<<<<< HEAD
=======
// Railway provides DATABASE_URL automatically when PostgreSQL plugin is added.
// Fall back to individual env vars for local Docker development.
const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: false,
      dialectOptions: {
        ssl: process.env.DATABASE_URL.includes('railway')
          ? { require: true, rejectUnauthorized: false }
          : false,
      },
    })
  : new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 5432,
        dialect: 'postgres',
        logging: false,
      }
    );
>>>>>>> 531c062 (popi's changes)
=======
>>>>>>> 5ab37d8 (WIP)

module.exports = sequelize;

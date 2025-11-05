// knexfile.js
// Knex configuration for migrations. Reads the same env flags used by database/connection.js
require('dotenv').config();

const useLocalhost = process.env.USE_LOCALHOST === 'true';

const base = useLocalhost
  ? {
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'miniecom',
    }
  : {
      host: process.env.DB_SERVER_HOST,
      user: process.env.DB_SERVER_USER,
      password: process.env.DB_SERVER_PASSWORD,
      database: process.env.DB_SERVER_DATABASE,
    };

module.exports = {
  development: {
    client: 'mysql2',
    connection: base,
    migrations: {
      directory: './migrations',
      tableName: 'knex_migrations',
    },
  },
  production: {
    client: 'mysql2',
    connection: base,
    migrations: {
      directory: './migrations',
      tableName: 'knex_migrations',
    },
  },
};

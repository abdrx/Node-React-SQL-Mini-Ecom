// database/knex.js
const knexLib = require('knex');
const config = require('../knexfile');

// Choose environment; default to development
const env = process.env.NODE_ENV || 'development';

const knex = knexLib(config[env]);

module.exports = knex;

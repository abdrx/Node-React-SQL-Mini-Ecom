// 20251105_initial_schema.js
/**
 * Knex migration to create initial e_commerce schema with foreign keys.
 * Mirrors database/createTables.sql
 */

exports.up = async function (knex) {
  // users
  const hasUsers = await knex.schema.hasTable('users');
  if (!hasUsers) {
    await knex.schema.createTable('users', (table) => {
    table.increments('userId').primary();
    table.string('fname', 30).notNullable();
    table.string('lname', 30).notNullable();
    table.string('email', 50);
    table.string('password', 200);
    table.boolean('isAdmin');
    table.timestamp('createdDate').defaultTo(knex.fn.now());
    });
  }

  // product
  const hasProduct = await knex.schema.hasTable('product');
  if (!hasProduct) {
    await knex.schema.createTable('product', (table) => {
    table.increments('productId').primary();
    table.string('name', 30).notNullable();
    table.text('description', 'tiny');
    table.decimal('price', 10, 2);
    table.timestamp('createdDate').defaultTo(knex.fn.now());
    });
  }

  // orders
  const hasOrders = await knex.schema.hasTable('orders');
  if (!hasOrders) {
    await knex.schema.createTable('orders', (table) => {
    table.increments('orderId').primary();
    table.integer('userId', 5).unsigned();
    table.string('address', 500);
    table.decimal('totalPrice', 10, 2);
    table.timestamp('createdDate').defaultTo(knex.fn.now());

    table
      .foreign('userId')
      .references('userId')
      .inTable('users');
    });
  }

  // shopingCart (spelling as-is from existing schema)
  const hasCart = await knex.schema.hasTable('shopingCart');
  if (!hasCart) {
    await knex.schema.createTable('shopingCart', (table) => {
    table.integer('userId', 5).unsigned().notNullable();
    table.integer('productId', 5).unsigned().notNullable();
    table.integer('quantity');

    table.primary(['userId', 'productId']);

    table
      .foreign('userId')
      .references('userId')
      .inTable('users');

    table
      .foreign('productId')
      .references('productId')
      .inTable('product');
    });
  }

  // productsInOrder
  const hasPIO = await knex.schema.hasTable('productsInOrder');
  if (!hasPIO) {
    await knex.schema.createTable('productsInOrder', (table) => {
    table.integer('orderId', 5).unsigned().notNullable();
    table.integer('productId', 5).unsigned().notNullable();
    table.integer('quantity');
    table.decimal('totalPrice', 10, 2);

    table.primary(['orderId', 'productId']);

    table
      .foreign('orderId')
      .references('orderId')
      .inTable('orders');

    table
      .foreign('productId')
      .references('productId')
      .inTable('product');
    });
  }
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('productsInOrder');
  await knex.schema.dropTableIfExists('shopingCart');
  await knex.schema.dropTableIfExists('orders');
  await knex.schema.dropTableIfExists('product');
  await knex.schema.dropTableIfExists('users');
};

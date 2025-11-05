// 20251105_add_stock_imageurl.js
/**
 * Add 'stock' and 'imageUrl' columns to product table to support admin panel features.
 */

exports.up = async function (knex) {
  const hasStock = await knex.schema.hasColumn('product', 'stock');
  if (!hasStock) {
    await knex.schema.alterTable('product', (table) => {
      table.integer('stock').notNullable().defaultTo(0).after('stockStatus');
    });
  }
  const hasImageUrl = await knex.schema.hasColumn('product', 'imageUrl');
  if (!hasImageUrl) {
    await knex.schema.alterTable('product', (table) => {
      table.string('imageUrl', 255).nullable().after('stock');
    });
  }
};

exports.down = async function (knex) {
  const hasImageUrl = await knex.schema.hasColumn('product', 'imageUrl');
  if (hasImageUrl) {
    await knex.schema.alterTable('product', (table) => {
      table.dropColumn('imageUrl');
    });
  }
  const hasStock = await knex.schema.hasColumn('product', 'stock');
  if (hasStock) {
    await knex.schema.alterTable('product', (table) => {
      table.dropColumn('stock');
    });
  }
};

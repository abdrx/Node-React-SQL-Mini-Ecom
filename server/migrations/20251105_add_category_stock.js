// 20251105_add_category_stock.js
/**
 * Add 'category' and 'stockStatus' to product table.
 */

exports.up = async function (knex) {
  const hasCategory = await knex.schema.hasColumn('product', 'category');
  if (!hasCategory) {
    await knex.schema.alterTable('product', (table) => {
      table.string('category', 50).nullable().after('name');
    });
  }
  const hasStock = await knex.schema.hasColumn('product', 'stockStatus');
  if (!hasStock) {
    await knex.schema.alterTable('product', (table) => {
      table
        .enum('stockStatus', ['in_stock', 'out_of_stock'])
        .notNullable()
        .defaultTo('in_stock')
        .after('category');
    });
  }
};

exports.down = async function (knex) {
  const hasStock = await knex.schema.hasColumn('product', 'stockStatus');
  if (hasStock) {
    await knex.schema.alterTable('product', (table) => {
      table.dropColumn('stockStatus');
    });
  }
  const hasCategory = await knex.schema.hasColumn('product', 'category');
  if (hasCategory) {
    await knex.schema.alterTable('product', (table) => {
      table.dropColumn('category');
    });
  }
};

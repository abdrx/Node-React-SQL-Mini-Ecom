// 20251105_add_stock_and_image.js
/**
 * Add numeric stock count and imageUrl to product table.
 */

exports.up = async function (knex) {
  const hasStock = await knex.schema.hasColumn('product', 'stock');
  if (!hasStock) {
    await knex.schema.alterTable('product', (table) => {
      table.integer('stock').unsigned().notNullable().defaultTo(0).after('price');
    });
  }

  const hasImage = await knex.schema.hasColumn('product', 'imageUrl');
  if (!hasImage) {
    await knex.schema.alterTable('product', (table) => {
      table.string('imageUrl', 255).nullable().after('stock');
    });
  }
};

exports.down = async function (knex) {
  const hasImage = await knex.schema.hasColumn('product', 'imageUrl');
  if (hasImage) {
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


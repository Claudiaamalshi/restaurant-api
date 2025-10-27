'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const indexes = [
      { name: 'order_items_order_id', fields: ['order_id'] },
      { name: 'order_items_dish_id', fields: ['dish_id'] },
    ];

    for (const index of indexes) {
      const [existing] = await queryInterface.sequelize.query(`
        SHOW INDEXES FROM order_items WHERE Key_name = '${index.name}';
      `);
      if (existing.length === 0) {
        await queryInterface.addIndex('order_items', index.fields, { name: index.name });
      }
    }
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('order_items', 'order_items_order_id');
    await queryInterface.removeIndex('order_items', 'order_items_dish_id');
  },
};

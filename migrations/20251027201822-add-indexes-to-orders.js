'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const indexes = [
      { name: 'idx_orders_restaurant_status_created', fields: ['restaurant_id', 'status', 'created_at'] },
      { name: 'idx_orders_user_created', fields: ['user_id', 'created_at'] },
      { name: 'idx_orders_created_at', fields: ['created_at'] },
      { name: 'idx_orders_status', fields: ['status'] },
    ];

    for (const index of indexes) {
      const [existing] = await queryInterface.sequelize.query(`
        SHOW INDEXES FROM orders WHERE Key_name = '${index.name}';
      `);
      if (existing.length === 0) {
        await queryInterface.addIndex('orders', index.fields, { name: index.name });
      }
    }
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('orders', 'idx_orders_restaurant_status_created');
    await queryInterface.removeIndex('orders', 'idx_orders_user_created');
    await queryInterface.removeIndex('orders', 'idx_orders_created_at');
    await queryInterface.removeIndex('orders', 'idx_orders_status');
  },
};

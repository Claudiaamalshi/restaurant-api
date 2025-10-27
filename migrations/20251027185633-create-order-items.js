'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    if (!tables.includes('order_items')) {
      console.log('Creating table "order_items"...');
      await queryInterface.createTable('order_items', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.literal('(UUID())'),
          primaryKey: true,
        },
        order_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: 'orders', key: 'id' },
          onDelete: 'CASCADE',
        },
        dish_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: 'dishes', key: 'id' },
          onDelete: 'RESTRICT',
        },
        quantity: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        price_at_order: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false,
        },
        subtotal: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false,
        },
        created_at: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updated_at: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
        },
      });
    } else {
      console.log('Table "order_items" already exists — skipping creation');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('order_items');
  },
};

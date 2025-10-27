'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    if (!tables.includes('orders')) {
      console.log('Creating table "orders"...');
      await queryInterface.createTable('orders', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.literal('(UUID())'),
          primaryKey: true,
        },
        user_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: 'users', key: 'id' },
          onDelete: 'CASCADE',
        },
        restaurant_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: 'restaurants', key: 'id' },
          onDelete: 'RESTRICT',
        },
        status: {
          type: Sequelize.ENUM('PENDING', 'CONFIRMED', 'DELIVERED', 'CANCELLED'),
          defaultValue: 'PENDING',
          allowNull: false,
        },
        total_amount: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false,
          defaultValue: 0.0,
        },
        notes: {
          type: Sequelize.TEXT,
          allowNull: true,
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
      console.log('Table "orders" already exists — skipping creation');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('orders');
  },
};

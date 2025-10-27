'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    if (!tables.includes('users')) {
      console.log('Creating table "users"...');
      await queryInterface.createTable('users', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.literal('(UUID())'),
          primaryKey: true,
        },
        email: {
          type: Sequelize.STRING(255),
          allowNull: false,
          unique: true,
        },
        password: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        role: {
          type: Sequelize.ENUM('CUSTOMER', 'OWNER', 'ADMIN', 'SUPER_ADMIN'),
          allowNull: false,
          defaultValue: 'CUSTOMER',
        },
        failed_login_attempts: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
        },
        lockout_until: {
          type: Sequelize.DATE,
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
      console.log('Table "users" already exists — skipping creation');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  },
};

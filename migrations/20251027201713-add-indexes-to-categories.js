'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const [existing] = await queryInterface.sequelize.query(`
      SHOW INDEXES FROM categories WHERE Key_name = 'categories_menu_id';
    `);
    if (existing.length === 0) {
      await queryInterface.addIndex('categories', ['menu_id'], {
        name: 'categories_menu_id',
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('categories', 'categories_menu_id');
  },
};

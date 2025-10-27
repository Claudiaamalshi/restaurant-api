'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const [existing] = await queryInterface.sequelize.query(`
      SHOW INDEXES FROM menus WHERE Key_name = 'menus_restaurant_id';
    `);
    if (existing.length === 0) {
      await queryInterface.addIndex('menus', ['restaurant_id'], {
        name: 'menus_restaurant_id',
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('menus', 'menus_restaurant_id');
  },
};

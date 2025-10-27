'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const indexes = [
      { name: 'dishes_category_id', fields: ['category_id'] },
      { name: 'dishes_is_available', fields: ['is_available'] },
    ];

    for (const index of indexes) {
      const [existing] = await queryInterface.sequelize.query(`
        SHOW INDEXES FROM dishes WHERE Key_name = '${index.name}';
      `);
      if (existing.length === 0) {
        await queryInterface.addIndex('dishes', index.fields, { name: index.name });
      }
    }
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('dishes', 'dishes_category_id');
    await queryInterface.removeIndex('dishes', 'dishes_is_available');
  },
};

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const indexes = [
      { name: 'restaurants_name', fields: ['name'] },
      { name: 'restaurants_owner_id', fields: ['owner_id'] },
      { name: 'restaurants_is_active', fields: ['is_active'] },
    ];

    for (const index of indexes) {
      const [existing] = await queryInterface.sequelize.query(`
        SHOW INDEXES FROM restaurants WHERE Key_name = '${index.name}';
      `);
      if (existing.length === 0) {
        await queryInterface.addIndex('restaurants', index.fields, { name: index.name });
      }
    }
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('restaurants', 'restaurants_name');
    await queryInterface.removeIndex('restaurants', 'restaurants_owner_id');
    await queryInterface.removeIndex('restaurants', 'restaurants_is_active');
  },
};

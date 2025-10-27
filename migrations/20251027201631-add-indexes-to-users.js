'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const [existing] = await queryInterface.sequelize.query(`
      SHOW INDEXES FROM users WHERE Key_name = 'users_email';
    `);
    if (existing.length === 0) {
      await queryInterface.addIndex('users', ['email'], {
        name: 'users_email',
        unique: true,
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('users', 'users_email');
  },
};

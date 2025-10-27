'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const indexes = [
      { name: 'refresh_tokens_user_id', fields: ['user_id'] },
      { name: 'refresh_tokens_token', fields: ['token'], unique: true },
      { name: 'refresh_tokens_expires_at', fields: ['expires_at'] },
    ];

    for (const index of indexes) {
      const [existing] = await queryInterface.sequelize.query(`
        SHOW INDEXES FROM refresh_tokens WHERE Key_name = '${index.name}';
      `);
      if (existing.length === 0) {
        await queryInterface.addIndex('refresh_tokens', index.fields, {
          name: index.name,
          unique: index.unique || false,
        });
      }
    }
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('refresh_tokens', 'refresh_tokens_user_id');
    await queryInterface.removeIndex('refresh_tokens', 'refresh_tokens_token');
    await queryInterface.removeIndex('refresh_tokens', 'refresh_tokens_expires_at');
  },
};

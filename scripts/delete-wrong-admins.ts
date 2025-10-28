/**
 * Cleanup script — delete wrongly created admin accounts
 * 
 * Run safely using: `npx ts-node scripts/delete-wrong-admins.ts`
 * 
 * Delete only the specified admin users from the database.
 */

import 'dotenv/config';
import sequelize from '../src/config/database';
import User from '../src/models/User';

async function deleteWrongAdmins() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    const wrongAdminEmails = [
      'admin1@eatmeglobal.com',
      'admin2@eatmeglobal.com',
    ];

    for (const email of wrongAdminEmails) {
      const deletedCount = await User.destroy({ where: { email } });
      if (deletedCount > 0) {
        console.log(`🗑️ Deleted admin account: ${email}`);
      } else {
        console.log(`⚠️ No admin account found for: ${email}`);
      }
    }

    console.log('🎯 Cleanup completed successfully.');
  } catch (error) {
    console.error('❌ Error deleting admins:', error);
  } finally {
    await sequelize.close();
    console.log('🔒 Database connection closed.');
  }
}

deleteWrongAdmins();

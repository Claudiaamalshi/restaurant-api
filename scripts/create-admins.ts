/**
 * 🚀 Server-side script to create initial ADMIN users
 * One time run after migrations: `npx ts-node scripts/create-admins.ts`
 * 
 * Restriction: Admin creation is disabled through API routes — only allowed via this script.
 */

import 'dotenv/config';
import sequelize from '../src/config/database';
import User from '../src/models/User';
import { UserRole } from '../src/types';

async function createAdmins() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    const admins = [
      {
        email: 'admin1@dinetap.com',
        password: 'Admin@12345', // hash will apply automatically
        role: UserRole.ADMIN,
      },
      {
        email: 'admin2@dinetap.com',
        password: 'Admin@12345',
        role: UserRole.ADMIN,
      },
    ];

    for (const adminData of admins) {
      const existing = await User.findOne({ where: { email: adminData.email } });
      if (existing) {
        console.log(`⚠️ Skipping ${adminData.email}: already exists.`);
        continue;
      }

      const admin = await User.create(adminData);
      console.log(`✅ Created admin: ${admin.email}`);
    }

    console.log('🎉 Admin setup completed successfully!');
  } catch (error) {
    console.error('❌ Error creating admins:', error);
  } finally {
    await sequelize.close();
    console.log('🔒 Database connection closed.');
  }
}

createAdmins();

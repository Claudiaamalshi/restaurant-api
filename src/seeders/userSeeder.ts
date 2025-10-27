import { faker } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';
import User from '../models/User';
import { UserRole } from '../types';

/**
 * Seeder for User model.
 * Adds mock users without deleting existing data.
 */
export class UserSeeder {
  async seed(count: number = 100): Promise<void> {
    console.log(`\n🌱 Starting to seed up to ${count} users (without clearing existing ones)...`);

    try {
      // Count existing users
      const existingCount = await User.count();
      console.log(`👤 Existing users found: ${existingCount}`);

      // If already have enough users, skip
      if (existingCount >= count) {
        console.log(`✓ Already have ${existingCount} users, skipping seeding.`);
        return;
      }

      const usersToCreate = count - existingCount;
      console.log(`🆕 Creating ${usersToCreate} new mock users...`);

      const roles = Object.values(UserRole); // e.g. ['CUSTOMER', 'RESTAURANT_OWNER', 'ADMIN']

      const usersData = Array.from({ length: usersToCreate }, () => {
        const role = faker.helpers.arrayElement(roles);

        return {
          id: uuidv4(),
          email: faker.internet.email().toLowerCase(),
          password: 'Password123!', // will be hashed automatically via hook
          role,
          failedLoginAttempts: 0,
          lockoutUntil: null,
          createdAt: faker.date.past({ years: 1 }),
          updatedAt: new Date(),
        };
      });

      await User.bulkCreate(usersData, { validate: true, individualHooks: true });
      console.log(`✓ Successfully added ${usersToCreate} users.`);

    } catch (error) {
      console.error('✗ Error seeding users:', error);
      throw error;
    }
  }
}

export default new UserSeeder();

import { connectDatabase, disconnectDatabase } from '../src/config/database';
import userSeeder from '../src/seeders/userSeeder';

async function main() {
  await connectDatabase();

  const countArg = process.argv[2];
  const count = countArg ? parseInt(countArg, 10) : 100;

  await userSeeder.seed(count);

  await disconnectDatabase();
  process.exit(0);
}

main().catch(async (err) => {
  console.error('User seeding failed:', err);
  try {
    await disconnectDatabase();
  } catch {}
  process.exit(1);
});

import { connectDatabase, disconnectDatabase } from '../src/config/database';
import orderSeeder from '../src/seeders/orderSeeder';

async function main() {
  await connectDatabase();

  const countArg = process.argv[2];
  const count = countArg ? parseInt(countArg, 10) : 10000;

  await orderSeeder.seed(count);

  await disconnectDatabase();
  process.exit(0);
}

main().catch(async (err) => {
  console.error('Order seeding failed:', err);
  try {
    await disconnectDatabase();
  } catch {}
  process.exit(1);
});
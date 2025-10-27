import { faker } from '@faker-js/faker';
import { User, Restaurant, Menu, Category, Dish, Order, OrderItem } from '../models';
import { OrderStatus, UserRole } from '../types';

export class OrderSeeder {
  async seed(count: number = 10000): Promise<void> {
    console.log(`\n🌱 Starting to seed ${count} orders...`);
    const startTime = Date.now();

    try {
      // 1️⃣ Get all customers
      const customers = await User.findAll({
        where: { role: UserRole.CUSTOMER },
        attributes: ['id'],
      });

      if (!customers.length) {
        throw new Error('No customers found. Please seed users first.');
      }

      // 2️⃣ Get all active restaurants
      const restaurants = await Restaurant.findAll({
        where: { isActive: true },
        attributes: ['id'],
      });

      if (!restaurants.length) {
        throw new Error('No restaurants found. Please seed restaurants first.');
      }

      // 3️⃣ Fetch dishes grouped by restaurant (via Menu -> Category -> Dish)
      const dishesByRestaurant = new Map<string, any[]>();

      for (const restaurant of restaurants) {
        const menu = await Menu.findOne({
          where: { restaurantId: restaurant.id },
          include: [
            {
              model: Category,
              as: 'categories', // Must match index.ts association
              include: [
                {
                  model: Dish,
                  as: 'dishes', // Must match index.ts association
                  where: { isAvailable: true },
                  attributes: ['id', 'price'],
                  required: false, // in case some categories have no dishes
                },
              ],
              required: false, // in case a menu has no categories
            },
          ],
        });

        if (menu && menu.categories?.length) {
          const allDishes = menu.categories.flatMap((cat: any) => cat.dishes || []);
          if (allDishes.length > 0) {
            dishesByRestaurant.set(restaurant.id, allDishes);
          }
        }
      }

      if (!dishesByRestaurant.size) {
        throw new Error('No dishes found. Please seed menus and dishes first.');
      }

      // 4️⃣ Seed orders in batches
      const batchSize = 1000;
      const orderStatuses = Object.values(OrderStatus);
      let createdCount = 0;

      for (let i = 0; i < count; i += batchSize) {
        const currentBatchSize = Math.min(batchSize, count - i);
        const ordersData: any[] = [];
        const orderItemsData: any[] = [];

        for (let j = 0; j < currentBatchSize; j++) {
          const customer = faker.helpers.arrayElement(customers);
          const restaurantId = faker.helpers.arrayElement(Array.from(dishesByRestaurant.keys()));
          const dishes = dishesByRestaurant.get(restaurantId)!;

          const createdAt = faker.date.between({
            from: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
            to: new Date(),
          });

          const orderId = faker.string.uuid();
          const status = faker.helpers.arrayElement(orderStatuses);
          const numItems = faker.number.int({ min: 1, max: 5 });
          const selectedDishes = faker.helpers.arrayElements(dishes, numItems);

          let totalAmount = 0;

          for (const dish of selectedDishes) {
            const quantity = faker.number.int({ min: 1, max: 5 });
            const priceAtOrder = parseFloat(dish.price.toString());
            const subtotal = quantity * priceAtOrder;
            totalAmount += subtotal;

            orderItemsData.push({
              id: faker.string.uuid(),
              orderId,
              dishId: dish.id,
              quantity,
              priceAtOrder,
              subtotal,
              createdAt,
              updatedAt: createdAt,
            });
          }

          ordersData.push({
            id: orderId,
            userId: customer.id,
            restaurantId,
            status,
            totalAmount: totalAmount.toFixed(2),
            notes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.3 }),
            createdAt,
            updatedAt: createdAt,
          });
        }

        await Order.bulkCreate(ordersData, { validate: false });
        await OrderItem.bulkCreate(orderItemsData, { validate: false });

        createdCount += currentBatchSize;
        const progress = ((createdCount / count) * 100).toFixed(1);
        process.stdout.write(`\r📊 Progress: ${createdCount}/${count} (${progress}%)`);
      }

      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);

      console.log(`\n✓ Successfully seeded ${createdCount} orders in ${duration}s`);
      console.log(`✓ Average: ${(createdCount / parseFloat(duration)).toFixed(0)} orders/second`);
    } catch (error) {
      console.error('\n✗ Error seeding orders:', error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    console.log('🗑️  Clearing existing orders...');
    await OrderItem.destroy({ where: {}, force: true });
    await Order.destroy({ where: {}, force: true });
    console.log('✓ Orders cleared');
  }
}

export default new OrderSeeder();

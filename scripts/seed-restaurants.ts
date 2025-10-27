import { faker } from '@faker-js/faker';
import sequelize from '../src/config/database';
import Restaurant from '../src/models/Restaurant';
import Menu from '../src/models/Menu';
import Category from '../src/models/Category';
import Dish from '../src/models/Dish';
import User from '../src/models/User';
import { PriceRange } from '../src/types';
import { UserRole } from '../src/types';

const NUM_RESTAURANTS = 60;

async function seed() {
  try {
    // Sync tables without dropping existing users
    await sequelize.sync({ alter: true });

    // Fetch a random restaurant owner, or create one if none exist
    let users = await User.findAll({ where: { role: UserRole.RESTAURANT_OWNER } });
    let restaurantOwnerId: string;

    if (users.length === 0) {
      const owner = await User.create({
        email: 'owner@example.com',
        password: 'password123', // hashed by model hook
        role: UserRole.RESTAURANT_OWNER,
    });
      restaurantOwnerId = owner.id;
    } else {
      restaurantOwnerId = users[Math.floor(Math.random() * users.length)].id;
    }

    for (let i = 0; i < NUM_RESTAURANTS; i++) {
      const restaurant = await Restaurant.create({
        ownerId: restaurantOwnerId,
        name: faker.company.name(),
        description: faker.lorem.sentence(),
        address: faker.location.streetAddress(),
        phone: faker.phone.number(),
        email: faker.internet.email(),
        cuisineType: faker.helpers.arrayElement([
          'Italian', 'Chinese', 'Indian', 'Japanese', 'Mexican', 'French', 'Thai',
        ]),
        priceRange: faker.helpers.arrayElement([
          PriceRange.BUDGET,
          PriceRange.MODERATE,
          PriceRange.EXPENSIVE,
        ]),
        openingHours: {
          'mon-fri': '10:00-22:00',
          'sat-sun': '12:00-23:00',
        },
        imageUrl: faker.image.urlLoremFlickr({ category: 'food', width: 640, height: 480 }),
        logoUrl: faker.image.urlLoremFlickr({ category: 'business', width: 200, height: 200 }),
      });

      // 1 menu per restaurant
      const menu = await Menu.create({
        restaurantId: restaurant.id,
        name: `${restaurant.name} Menu`,
        description: faker.lorem.sentence(),
      });

      // 3-6 categories per menu
      const numCategories = faker.number.int({ min: 3, max: 6 });
      for (let c = 0; c < numCategories; c++) {
        const category = await Category.create({
          menuId: menu.id,
          name: faker.commerce.department(),
          description: faker.lorem.sentence(),
          displayOrder: c + 1,
          isAvailable: true,
        });

        // 3-10 dishes per category
        const numDishes = faker.number.int({ min: 3, max: 10 });
        for (let d = 0; d < numDishes; d++) {
          await Dish.create({
            categoryId: category.id,
            name: faker.commerce.productName(),
            description: faker.commerce.productDescription(),
            price: parseFloat(faker.commerce.price({ min: 5, max: 100 })),
            isAvailable: true,
            averageRating: faker.number.float({ min: 0, max: 5, precision: 0.1 }),
            ratingCount: faker.number.int({ min: 0, max: 100 }),
            imageUrl: faker.image.urlLoremFlickr({ category: 'food', width: 640, height: 480 }),
          });
        }
      }
    }

    console.log('Seeding completed!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();

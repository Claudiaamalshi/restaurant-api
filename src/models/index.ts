import User from './User';
import RefreshToken from './RefreshToken';
import Restaurant from './Restaurant';
import Menu from './Menu';
import Category from './Category';
import Dish from './Dish';
import Order from './Order';
import OrderItem from './OrderItem';

/**
 * Associations
 */
// User -> Restaurant
User.hasMany(Restaurant, { foreignKey: 'ownerId', as: 'restaurants' });
Restaurant.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

// Restaurant -> Menu (one-to-one)
Restaurant.hasOne(Menu, { foreignKey: 'restaurantId', as: 'menu' });
Menu.belongsTo(Restaurant, { foreignKey: 'restaurantId', as: 'restaurant' });

// Menu -> Category
Menu.hasMany(Category, { foreignKey: 'menuId', as: 'categories' });
Category.belongsTo(Menu, { foreignKey: 'menuId', as: 'menu' });

// Category -> Dish
Category.hasMany(Dish, { foreignKey: 'categoryId', as: 'dishes' });
Dish.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// User -> Order
User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'customer' });

// Restaurant -> Order
Restaurant.hasMany(Order, { foreignKey: 'restaurantId', as: 'orders' });
Order.belongsTo(Restaurant, { foreignKey: 'restaurantId', as: 'restaurant' });

// Order -> OrderItem
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

// Dish -> OrderItem
Dish.hasMany(OrderItem, { foreignKey: 'dishId', as: 'orderItems' });
OrderItem.belongsTo(Dish, { foreignKey: 'dishId', as: 'dish' });



// Export all models
export { User, RefreshToken, Restaurant, Menu, Category, Dish, Order, OrderItem};

/**
 * Safe model synchronization
 * Only runs in development or test environment
 */
export const syncModels = async (force = false): Promise<void> => {
  const isDevOrTest = ['development', 'test'].includes(process.env.NODE_ENV || '');

  if (!isDevOrTest) {
    console.warn('⚠️ syncModels() skipped — unsafe to run outside development or test environments.');
    return;
  }

  try {
    console.log(`🔄 Synchronizing models (${force ? 'force' : 'safe'})...`);
    await User.sync({ force });
    await RefreshToken.sync({ force });
    await Restaurant.sync({ force });
    await Menu.sync({ force });
    await Category.sync({ force });
    await Dish.sync({ force });
    await Order.sync({ force });
    await OrderItem.sync({ force });
    console.log('✅ All models synchronized successfully!');
  } catch (err) {
    console.error('❌ Error syncing models:', err);
  }
};

export default {
  User,
  RefreshToken,
  Restaurant,
  Menu,
  Category,
  Dish,
  Order,
  OrderItem,
  syncModels,
};
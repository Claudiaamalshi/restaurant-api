import User from './User';
import RefreshToken from './RefreshToken';
import Restaurant from './Restaurant';
import Menu from './Menu';
import Category from './Category';
import Dish from './Dish';

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


// Export all models
export { User, RefreshToken, Restaurant, Menu, Category, Dish};

// Sync all models (for development)
export const syncModels = async (force = false): Promise<void> => {
  await User.sync({ force });
  await RefreshToken.sync({ force });
  await Restaurant.sync({ force });
  await Menu.sync({ force });
  await Category.sync({ force });
  await Dish.sync({ force });
  console.log('✓ All models synchronized');
};

export default {
  User,
  RefreshToken,
  Restaurant,
  Menu,
  Category,
  Dish,
  syncModels,
};
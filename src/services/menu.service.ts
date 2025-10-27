// src/services/menu.service.ts
import Menu from '../models/Menu';
import Category from '../models/Category';
import Dish from '../models/Dish';

interface DishFilters {
  includeUnavailable?: boolean;
  sortBy?: 'price' | 'rating' | 'name';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export async function getAllMenus() {
  const menus = await Menu.findAll({
    include: [
      {
        model: Category,
        as: 'categories',
        include: [
          {
            model: Dish,
            as: 'dishes',
          },
        ],
      },
    ],
    order: [['createdAt', 'DESC']],
  });

  return menus;
}

export async function getFullMenu(menuId: string, filters: DishFilters) {
  const limit = filters.limit && filters.limit > 0 ? filters.limit : 10;

  // Fetch categories with nested dishes
  const categories = await Category.findAll({
    where: { menuId },
    include: [
      {
        model: Dish,
        as: 'dishes', // Must match alias defined in association
        where: filters.includeUnavailable ? {} : { isAvailable: true },
        required: false, // include even if no dishes
        separate: true, // enables pagination on nested association
        limit,
        order: [
          filters.sortBy === 'price' && ['price', filters.order || 'asc'],
          filters.sortBy === 'rating' && ['averageRating', filters.order || 'desc'],
          filters.sortBy === 'name' && ['name', filters.order || 'asc'],
        ].filter(Boolean) as any,
      },
    ],
    order: [['name', 'asc']], // categories sorted by name
  });

  return {
    menuId,
    categories,
  };
}

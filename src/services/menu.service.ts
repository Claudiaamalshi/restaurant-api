import Category from '../models/Category';
import Dish from '../models/Dish';

interface DishFilters {
  includeUnavailable?: boolean;
  sortBy?: 'price' | 'rating' | 'name';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export async function getFullMenu(menuId: string, filters: DishFilters) {
  // Default pagination
  const limit = filters.limit && filters.limit > 0 ? filters.limit : 10;

  // Fetch categories for the menu
  const categories = await Category.findAll({
    where: { menuId },
    include: [{
      model: Dish,
      where: filters.includeUnavailable ? {} : { isAvailable: true },
      required: false,
      order: [
        filters.sortBy === 'price' && ['price', filters.order || 'asc'],
        filters.sortBy === 'rating' && ['averageRating', filters.order || 'desc'],
        filters.sortBy === 'name' && ['name', filters.order || 'asc']
      ].filter(Boolean) as any,
      limit,
      separate: true,
    }],
    order: [['name', 'asc']], // categories sorted by name
  });

  return {
    menuId,
    categories,
  };
}

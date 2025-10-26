import Dish, { DishCreationAttributes, DishAttributes } from '../models/Dish';
import Category from '../models/Category';
import { NotFoundError, ValidationError } from '../utils/errors';
import env from '../config/env';
import { PaginationQuery } from '../types';

interface DishFilters {
  isAvailable?: boolean;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

/**
 * Create a new dish under a category
 */
export const createDish = async (
  categoryId: string,
  data: Omit<DishCreationAttributes, 'categoryId'>
): Promise<Dish> => {
  // Validate that category exists
  const category = await Category.findByPk(categoryId);
  if (!category) {
    throw new NotFoundError('Category not found');
  }

  const dish = await Dish.create({
    ...data,
    categoryId,
  });

  return dish;
};

/**
 * Get all dishes by category with pagination and filters
 */
export const getAllDishes = async (
  categoryId: string,
  pagination: PaginationQuery,
  filters: DishFilters = {}
): Promise<{ dishes: Dish[]; total: number; page: number; totalPages: number }> => {
  const { page = 1, limit = env.DEFAULT_PAGE_SIZE } = pagination;
  if (page < 1 || limit < 1) {
    throw new ValidationError('Page and limit must be positive integers');
  }

  if (
    filters.minPrice !== undefined &&
    filters.maxPrice !== undefined &&
    filters.minPrice > filters.maxPrice
  ) {
    throw new ValidationError('minPrice cannot be greater than maxPrice');
  }

  const whereClause: any = { categoryId };

  if (filters.isAvailable !== undefined) whereClause.isAvailable = filters.isAvailable;
  if (filters.minPrice !== undefined) whereClause.price = { ...(whereClause.price || {}), ['>=']: filters.minPrice };
  if (filters.maxPrice !== undefined) whereClause.price = { ...(whereClause.price || {}), ['<=']: filters.maxPrice };
  if (filters.search)
    whereClause.name = { $like: `%${filters.search}%` };

  const offset = (page - 1) * limit;

  const { rows: dishes, count: total } = await Dish.findAndCountAll({
    where: whereClause,
    offset,
    limit,
    order: [['createdAt', 'DESC']],
  });

  return {
    dishes,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Get single dish by ID
 */
export const getDishById = async (id: string): Promise<Dish> => {
  const dish = await Dish.findByPk(id);
  if (!dish) {
    throw new NotFoundError('Dish not found');
  }
  return dish;
};

/**
 * Update an existing dish
 */
export const updateDish = async (id: string, data: Partial<DishAttributes>): Promise<Dish> => {
  const dish = await Dish.findByPk(id);
  if (!dish) {
    throw new NotFoundError('Dish not found');
  }

  await dish.update(data);
  return dish;
};

/**
 * Delete a dish by ID
 */
export const deleteDish = async (id: string): Promise<void> => {
  const dish = await Dish.findByPk(id);
  if (!dish) {
    throw new NotFoundError('Dish not found');
  }

  await dish.destroy();
};

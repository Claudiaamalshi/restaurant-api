// src/services/category.service.ts
import Category from '../models/Category';

interface PaginationParams {
  page?: number;
  limit?: number;
}

class CategoryService {
  /**
   * Create a new category for a given menu
   */
  async createCategory(menuId: string, data: any) {
    return Category.create({
      ...data,
      menuId,
      isAvailable: data.isAvailable ?? true,
    });
  }

  /**
   * Get all categories for a menu with pagination and optional filter
   */
  async getAllCategories(
    menuId: string,
    pagination: PaginationParams = {},
    filters: any = {}
  ) {
    const page = pagination.page ? Number(pagination.page) : 1;
    const limit = pagination.limit ? Number(pagination.limit) : 10;
    const offset = (page - 1) * limit;

    const whereClause: any = { menuId };

    if (filters.isAvailable !== undefined) {
      whereClause.isAvailable = filters.isAvailable === 'true';
    }

    const { rows, count } = await Category.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['displayOrder', 'ASC']],
    });

    return {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
      data: rows,
    };
  }

  /**
   * Get single category by ID
   */
  async getCategoryById(id: string) {
    const category = await Category.findByPk(id);
    if (!category) throw new Error('Category not found');
    return category;
  }

  /**
   * Update an existing category
   */
  async updateCategory(id: string, data: any) {
    const category = await Category.findByPk(id);
    if (!category) throw new Error('Category not found');
    return category.update(data);
  }

  /**
   * Delete category (soft delete preferred)
   */
  async deleteCategory(id: string) {
    const category = await Category.findByPk(id);
    if (!category) throw new Error('Category not found');
    // Soft delete — mark unavailable instead of removing
    await category.update({ isAvailable: false });
    return { message: 'Category disabled (soft deleted) successfully' };
  }
}

export default new CategoryService();

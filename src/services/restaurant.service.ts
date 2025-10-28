import { UserRole } from '@/types';
import Restaurant from '../models/Restaurant';

class RestaurantService {
  async create(data: any, ownerId: string) {
    return Restaurant.create({ ...data, ownerId });
  }

  async findAll(filters: any, pagination: any) {
    const where: any = {};

    if (filters.isActive !== undefined) {
      if (typeof filters.isActive === 'boolean') {
        where.isActive = filters.isActive;
      } else if (typeof filters.isActive === 'string') {
        const val = filters.isActive.toLowerCase();
        if (val === 'true') where.isActive = true;
        if (val === 'false') where.isActive = false;
      }
    }

    if (filters.cuisineType) {
      where.cuisineType = filters.cuisineType;
    }

    return Restaurant.findAll({
      where,
      ...pagination,
    });
  }

  async findById(id: string) {
    return Restaurant.findByPk(id, { include: ['menu'] });
  }

  async update(id: string, data: any, user: any) {
    const restaurant = await Restaurant.findByPk(id);
    if (!restaurant) throw new Error('Restaurant not found');
    // Ownership check
    if (user.role !== UserRole.ADMIN && restaurant.ownerId !== user.id) {
      throw new Error('Forbidden: Not the owner');
    }
    return restaurant.update(data);
  }

  async softDelete(id: string, user: any) {
    const restaurant = await Restaurant.findByPk(id);
    if (!restaurant) throw new Error('Restaurant not found');

    // Ownership check
    if (user.role !== UserRole.ADMIN && restaurant.ownerId !== user.id) {
      throw new Error('Forbidden: Not the owner');
    }

    return restaurant.update({ isActive: false });
  }
}

export default new RestaurantService();

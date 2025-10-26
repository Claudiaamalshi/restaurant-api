import Restaurant from '../models/Restaurant';

class RestaurantService {
  async create(data: any, ownerId: string) {
    return Restaurant.create({ ...data, ownerId });
  }

  async findAll(filters: any, pagination: any) {
    return Restaurant.findAll({
      where: filters,
      ...pagination,
    });
  }

  async findById(id: string) {
    return Restaurant.findByPk(id, { include: ['menu'] });
  }

  async update(id: string, data: any) {
    const restaurant = await Restaurant.findByPk(id);
    if (!restaurant) throw new Error('Restaurant not found');
    return restaurant.update(data);
  }

  async softDelete(id: string) {
    const restaurant = await Restaurant.findByPk(id);
    if (!restaurant) throw new Error('Restaurant not found');
    return restaurant.update({ isActive: false });
  }
}

export default new RestaurantService();

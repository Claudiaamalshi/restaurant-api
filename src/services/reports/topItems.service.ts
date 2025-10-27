import { QueryTypes } from 'sequelize';
import sequelize from '../../config/database';
import { TopItemsReportQuery } from '../../validators/reports/topItems.validator';
import { AuthorizationError } from '../../utils/errors';
import Restaurant from '../../models/Restaurant';

interface TopItemData {
  dishId: string;
  dishName: string;
  categoryName: string;
  restaurantName: string;
  totalQuantity: number;
  totalRevenue: string;
  orderCount: number;
}

export class TopItemsService {
  async getTopItems(
    userId: string,
    userRole: string,
    query: TopItemsReportQuery
  ): Promise<{ items: TopItemData[]; period: any; pagination: any }> {
    const {
      sortBy = 'revenue',
      from,
      to,
      restaurantId,
      status,
      page = 1,
      pageLimit = 20,
    } = query;

    // Authorization check
    if (restaurantId && userRole === 'RESTAURANT_OWNER') {
      const ownsRestaurant = await Restaurant.findOne({
        where: { id: restaurantId, ownerId: userId },
      });
      if (!ownsRestaurant) {
        throw new AuthorizationError('You do not own this restaurant');
      }
    }

    // Build WHERE clause
    const conditions: string[] = [];
    const replacements: any = {};

    if (from) {
      conditions.push('orders.created_at >= :from');
      replacements.from = from;
    }

    if (to) {
      conditions.push('orders.created_at <= :to');
      replacements.to = to;
    }

    if (restaurantId) {
      conditions.push('orders.restaurant_id = :restaurantId');
      replacements.restaurantId = restaurantId;
    } else if (userRole === 'RESTAURANT_OWNER') {
      const restaurants = await Restaurant.findAll({
        where: { ownerId: userId },
        attributes: ['id'],
      });
      const restaurantIds = restaurants.map(r => r.id);
      if (restaurantIds.length === 0) {
        return {
          items: [],
          period: { from: from || null, to: to || null },
          pagination: { total: 0, page, limit: pageLimit, totalPages: 0 },
        };
      }
      conditions.push('orders.restaurant_id IN (:restaurantIds)');
      replacements.restaurantIds = restaurantIds;
    }

    if (status && status.length > 0) {
      conditions.push('orders.status IN (:status)');
      replacements.status = status;
    } else {
      conditions.push(`orders.status != 'CANCELLED'`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Determine sort field
    const sortField = sortBy === 'quantity' ? 'totalQuantity' : 'totalRevenue';
    const sortOrder = 'DESC';

    // Get total count
    const countQuery = `
      SELECT COUNT(DISTINCT order_items.dish_id) as total
      FROM order_items
      INNER JOIN orders ON order_items.order_id = orders.id
      ${whereClause}
    `;

    const [countResult] = await sequelize.query(countQuery, {
      replacements,
      type: QueryTypes.SELECT,
    }) as any;

    const total = parseInt(countResult.total) || 0;
    const totalPages = Math.ceil(total / pageLimit);
    const offset = (page - 1) * pageLimit;

    // Main query
    const itemsQuery = `
      SELECT 
        dishes.id as dishId,
        dishes.name as dishName,
        categories.name as categoryName,
        restaurants.name as restaurantName,
        SUM(order_items.quantity) as totalQuantity,
        SUM(order_items.subtotal) as totalRevenue,
        COUNT(DISTINCT orders.id) as orderCount
      FROM order_items
      INNER JOIN orders ON order_items.order_id = orders.id
      INNER JOIN dishes ON order_items.dish_id = dishes.id
      INNER JOIN categories ON dishes.category_id = categories.id
      INNER JOIN menus ON categories.menu_id = menus.id
      INNER JOIN restaurants ON menus.restaurant_id = restaurants.id
      ${whereClause}
      GROUP BY dishes.id, dishes.name, categories.name, restaurants.name
      ORDER BY ${sortField} ${sortOrder}
      LIMIT :pageLimit OFFSET :offset
    `;

    replacements.pageLimit = pageLimit;
    replacements.offset = offset;

    const items = await sequelize.query(itemsQuery, {
      replacements,
      type: QueryTypes.SELECT,
    }) as TopItemData[];

    return {
      items: items.map(item => ({
        ...item,
        totalRevenue: parseFloat(item.totalRevenue).toFixed(2),
      })),
      period: {
        from: from || null,
        to: to || null,
      },
      pagination: {
        total,
        page,
        limit: pageLimit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }
}

export default new TopItemsService();
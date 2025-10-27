import { QueryTypes } from 'sequelize';
import sequelize from '../../config/database';
import { AvgOrderValueQuery } from '../../validators/reports/avgOrder.validator';
import { AuthorizationError } from '../../utils/errors';
import Restaurant from '../../models/Restaurant';

interface AvgOrderData {
  period?: string;
  averageOrderValue: string;
  orderCount: number;
  totalRevenue: string;
}

export class AvgOrderService {
  async getAvgOrderValue(
    userId: string,
    userRole: string,
    query: AvgOrderValueQuery
  ): Promise<{ averages: AvgOrderData[]; overall: any; pagination?: any }> {
    const {
      from,
      to,
      groupBy = 'overall',
      restaurantId,
      status,
      page = 1,
      limit = 20,
      sortBy = 'period',
      order = 'asc',
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
          averages: [],
          overall: { averageOrderValue: 0, totalOrders: 0, totalRevenue: 0 },
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

    // Get overall stats
    const overallQuery = `
      SELECT 
        COALESCE(AVG(orders.total_amount), 0) as averageOrderValue,
        COUNT(orders.id) as totalOrders,
        COALESCE(SUM(orders.total_amount), 0) as totalRevenue
      FROM orders
      ${whereClause}
    `;

    const [overall] = await sequelize.query(overallQuery, {
      replacements,
      type: QueryTypes.SELECT,
    }) as any;

    if (groupBy === 'overall') {
      return {
        averages: [{
          averageOrderValue: parseFloat(overall.averageOrderValue).toFixed(2),
          orderCount: parseInt(overall.totalOrders),
          totalRevenue: parseFloat(overall.totalRevenue).toFixed(2),
        }],
        overall: {
          averageOrderValue: parseFloat(overall.averageOrderValue).toFixed(2),
          totalOrders: parseInt(overall.totalOrders),
          totalRevenue: parseFloat(overall.totalRevenue).toFixed(2),
        },
      };
    }

    // Build date grouping
    let dateFormat: string;
    switch (groupBy) {
      case 'day':
        dateFormat = 'DATE(orders.created_at)';
        break;
      case 'week':
        dateFormat = 'DATE_FORMAT(orders.created_at, "%Y-%u")';
        break;
      case 'month':
        dateFormat = 'DATE_FORMAT(orders.created_at, "%Y-%m")';
        break;
      default:
        dateFormat = 'DATE(orders.created_at)';
    }

    // Pagination count
    const countQuery = `
      SELECT COUNT(DISTINCT ${dateFormat}) as total
      FROM orders
      ${whereClause}
    `;

    const [countResult] = await sequelize.query(countQuery, {
      replacements,
      type: QueryTypes.SELECT,
    }) as any;

    const total = parseInt(countResult.total) || 0;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;

    // ✅ Sorting improvement
    const validSortFields = ['period', 'averageOrderValue', 'orderCount', 'totalRevenue'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'period';
    const sortOrder = order?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Get grouped averages
    const averagesQuery = `
      SELECT 
        ${dateFormat} as period,
        COALESCE(AVG(orders.total_amount), 0) as averageOrderValue,
        COUNT(orders.id) as orderCount,
        COALESCE(SUM(orders.total_amount), 0) as totalRevenue
      FROM orders
      ${whereClause}
      GROUP BY ${dateFormat}
      ORDER BY ${sortField === 'period' ? dateFormat : sortField} ${sortOrder}
      LIMIT :limit OFFSET :offset
    `;

    replacements.limit = limit;
    replacements.offset = offset;

    const averages = await sequelize.query(averagesQuery, {
      replacements,
      type: QueryTypes.SELECT,
    }) as AvgOrderData[];

    return {
      averages: averages.map(avg => ({
        ...avg,
        averageOrderValue: parseFloat(avg.averageOrderValue).toFixed(2),
        totalRevenue: parseFloat(avg.totalRevenue).toFixed(2),
      })),
      overall: {
        averageOrderValue: parseFloat(overall.averageOrderValue).toFixed(2),
        totalOrders: parseInt(overall.totalOrders),
        totalRevenue: parseFloat(overall.totalRevenue).toFixed(2),
      },
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }
}

export default new AvgOrderService();

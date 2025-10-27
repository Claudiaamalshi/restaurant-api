import { QueryTypes } from 'sequelize';
import sequelize from '../../config/database';
import { SalesReportQuery } from '../../validators/reports/sales.validator';
import { AuthorizationError } from '../../utils/errors';
import Restaurant from '../../models/Restaurant';

interface SalesData {
  period: string;
  totalSales: string;
  orderCount: number;
}

export class SalesService {
  async getSalesReport(
    userId: string,
    userRole: string,
    query: SalesReportQuery
  ): Promise<{ sales: SalesData[]; summary: any; pagination: any }> {
    const { from, to, groupBy, restaurantId, status, page = 1, limit = 20, sortBy = 'period', order = 'asc' } = query;

    // Authorization check
    if (restaurantId && userRole === 'RESTAURANT_OWNER') {
      const ownsRestaurant = await Restaurant.findOne({
        where: { id: restaurantId, ownerId: userId },
      });
      if (!ownsRestaurant) {
        throw new AuthorizationError('You do not own this restaurant');
      }
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
    }

    // Build WHERE clause
    const conditions: string[] = [
      `orders.created_at >= :from`,
      `orders.created_at <= :to`,
    ];

    const replacements: any = { from, to };

    if (restaurantId) {
      conditions.push('orders.restaurant_id = :restaurantId');
      replacements.restaurantId = restaurantId;
    } else if (userRole === 'RESTAURANT_OWNER') {
      // Get owner's restaurants
      const restaurants = await Restaurant.findAll({
        where: { ownerId: userId },
        attributes: ['id'],
      });
      const restaurantIds = restaurants.map(r => r.id);
      if (restaurantIds.length === 0) {
        return { sales: [], summary: { totalSales: 0, totalOrders: 0 }, pagination: { total: 0, page, limit, totalPages: 0 } };
      }
      conditions.push(`orders.restaurant_id IN (:restaurantIds)`);
      replacements.restaurantIds = restaurantIds;
    }

    if (status && status.length > 0) {
      conditions.push('orders.status IN (:status)');
      replacements.status = status;
    } else {
      // Exclude cancelled by default
      conditions.push(`orders.status != 'CANCELLED'`);
    }

    const whereClause = conditions.join(' AND ');

    // Get total count
    const countQuery = `
      SELECT COUNT(DISTINCT ${dateFormat}) as total
      FROM orders
      WHERE ${whereClause}
    `;

    const [countResult] = await sequelize.query(countQuery, {
      replacements,
      type: QueryTypes.SELECT,
    }) as any;

    const total = parseInt(countResult.total) || 0;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;

    // Get sales data with pagination
    const salesQuery = `
      SELECT 
        ${dateFormat} as period,
        COALESCE(SUM(orders.total_amount), 0) as totalSales,
        COUNT(orders.id) as orderCount
      FROM orders
      WHERE ${whereClause}
      GROUP BY ${dateFormat}
      ORDER BY ${sortBy === 'period' ? dateFormat : sortBy} ${order.toUpperCase()}
      LIMIT :limit OFFSET :offset
    `;

    replacements.limit = limit;
    replacements.offset = offset;

    const sales = await sequelize.query(salesQuery, {
      replacements,
      type: QueryTypes.SELECT,
    }) as SalesData[];

    // Get summary
    const summaryQuery = `
      SELECT 
        COALESCE(SUM(orders.total_amount), 0) as totalSales,
        COUNT(orders.id) as totalOrders
      FROM orders
      WHERE ${whereClause}
    `;

    const [summary] = await sequelize.query(summaryQuery, {
      replacements,
      type: QueryTypes.SELECT,
    }) as any;

    return {
      sales,
      summary: {
        totalSales: parseFloat(summary.totalSales).toFixed(2),
        totalOrders: parseInt(summary.totalOrders),
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

export default new SalesService();
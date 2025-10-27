import { Op, WhereOptions } from 'sequelize';
import sequelize from '../config/database';
import Order from '../models/Order';
import OrderItem from '../models/OrderItem';
import Dish from '../models/Dish';
import Restaurant from '../models/Restaurant';
import User from '../models/User';
import Category from '../models/Category';
import {
  NotFoundError,
  ValidationError,
  AuthorizationError,
} from '../utils/errors';
import {
  CreateOrderInput,
  UpdateOrderStatusInput,
  ListOrdersQuery,
} from '../validators/order.validator';
import { OrderStatus } from '../types';

export class OrderService {
  /**
   * Create a new order with items (ATOMIC transaction)
   */
  async createOrder(
    userId: string,
    data: CreateOrderInput
  ): Promise<Order> {
    const transaction = await sequelize.transaction();

    try {
      // 1. Verify restaurant exists and is active
      const restaurant = await Restaurant.findByPk(data.restaurantId);
      if (!restaurant || !restaurant.isActive) {
        throw new NotFoundError('Restaurant');
      }

      // 2. Fetch all dishes and validate
      const dishIds = data.items.map(item => item.dishId);
      const dishes = await Dish.findAll({
        where: { id: dishIds },
        include: [
          {
            model: Category,
            as: 'category',
            include: [
              {
                model: require('../models/Menu').default,
                as: 'menu',
                where: { restaurantId: data.restaurantId },
              },
            ],
          },
        ],
        transaction,
      });

      // Validate all dishes exist and belong to the restaurant
      if (dishes.length !== dishIds.length) {
        throw new ValidationError('One or more dishes not found or do not belong to this restaurant');
      }

      // Check dish availability
      const unavailableDishes = dishes.filter(dish => !dish.isAvailable);
      if (unavailableDishes.length > 0) {
        throw new ValidationError(
          `The following dishes are currently unavailable: ${unavailableDishes
            .map(d => d.name)
            .join(', ')}`
        );
      }

      // 3. Create order
      const order = await Order.create(
        {
          userId,
          restaurantId: data.restaurantId,
          status: OrderStatus.PENDING,
          totalAmount: 0, // Will be calculated
          notes: data.notes,
        },
        { transaction }
      );

      // 4. Create order items and calculate total
      let totalAmount = 0;
      const orderItemsData = data.items.map(item => {
        const dish = dishes.find(d => d.id === item.dishId)!;
        const subtotal = dish.price * item.quantity;
        totalAmount += subtotal;

        return {
          orderId: order.id,
          dishId: item.dishId,
          quantity: item.quantity,
          priceAtOrder: dish.price,
          subtotal,
        };
      });

      await OrderItem.bulkCreate(orderItemsData, { transaction });

      // 5. Update order total
      order.totalAmount = totalAmount;
      await order.save({ transaction });

      // Commit transaction
      await transaction.commit();

      // 6. Reload order with items
      return await this.getOrderById(order.id, userId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Get order by ID with authorization check
   */
  async getOrderById(orderId: string, userId: string, userRole?: string): Promise<Order> {
    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Dish,
              as: 'dish',
              attributes: ['id', 'name', 'imageUrl'],
            },
          ],
        },
        {
          model: Restaurant,
          as: 'restaurant',
          attributes: ['id', 'name', 'address', 'phone'],
        },
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'email'],
        },
      ],
    });

    if (!order) {
      throw new NotFoundError('Order');
    }

    // Authorization: Customer can only view own orders
    // Restaurant owner can view their restaurant's orders
    // Admin can view all
    if (userRole !== 'ADMIN') {
      const isOwnOrder = order.userId === userId;
      const isRestaurantOwner =
        userRole === 'RESTAURANT_OWNER' &&
        (await Restaurant.findOne({ where: { id: order.restaurantId, ownerId: userId } }));

      if (!isOwnOrder && !isRestaurantOwner) {
        throw new AuthorizationError('You are not authorized to view this order');
      }
    }

    return order;
  }

  /**
   * List orders with filters and pagination
   */
  async listOrders(
  userId: string,
  userRole: string,
  query: ListOrdersQuery
): Promise<{ orders: Order[]; total: number; page: number; limit: number }> {
  const { page = 1, limit = 20, status, restaurantId, from, to, sortBy = 'createdAt', order: sortOrder = 'desc' } = query;
  const numericPage = Number(page) || 1;
  const numericLimit = Number(limit) || 20;
  const offset = (numericPage - 1) * numericLimit;

  // Build where clause
  const whereClause: WhereOptions = {};

  // Role-based filtering
  if (userRole === 'CUSTOMER') {
    whereClause.userId = userId;
  } else if (userRole === 'RESTAURANT_OWNER') {
    // Get restaurants owned by user
    const restaurants = await Restaurant.findAll({
      where: { ownerId: userId },
      attributes: ['id'],
    });

    const restaurantIds = restaurants.map(r => r.id);

    if (restaurantId) {
      // Verify owner owns this restaurant
      if (!restaurantIds.includes(restaurantId)) {
        throw new AuthorizationError('You do not own this restaurant');
      }
      whereClause.restaurantId = restaurantId;
    } else {
      // If no restaurants found, return empty result instead of querying DB
      if (restaurantIds.length === 0) {
        return { orders: [], total: 0, page: numericPage, limit: numericLimit };
      }
      whereClause.restaurantId = restaurantIds;
    }
  } else if (restaurantId) {
    // Admin filtering by specific restaurant
    whereClause.restaurantId = restaurantId;
  }

  // Status filter
  if (status) {
    whereClause.status = status;
  }

  // Date filters
  if (from || to) {
    whereClause.createdAt = {};
    if (from) whereClause.createdAt[Op.gte] = new Date(from);
    if (to) whereClause.createdAt[Op.lte] = new Date(to);
  }

  // Execute query
  const { rows: orders, count: total } = await Order.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: Restaurant,
        as: 'restaurant',
        attributes: ['id', 'name'],
      },
      {
        model: OrderItem,
        as: 'items',
        attributes: ['id', 'quantity', 'priceAtOrder', 'subtotal'],
      },
    ],
    order: [[sortBy, sortOrder.toUpperCase()]],
    limit: numericLimit,
    offset,
  });

  return { orders, total, page: numericPage, limit: numericLimit };
}


  /**
   * Update order status
   */
  async updateOrderStatus(
    orderId: string,
    userId: string,
    userRole: string,
    data: UpdateOrderStatusInput
  ): Promise<Order> {
    const order = await Order.findByPk(orderId);

    if (!order) {
      throw new NotFoundError('Order');
    }

    // Authorization check
    if (userRole === 'CUSTOMER') {
      // Customer can only cancel their own pending orders
      if (order.userId !== userId) {
        throw new AuthorizationError('You are not authorized to update this order');
      }
      if (data.status !== OrderStatus.CANCELLED || !order.canBeCancelled()) {
        throw new ValidationError('You can only cancel pending or confirmed orders');
      }
    } else if (userRole === 'RESTAURANT_OWNER') {
      // Restaurant owner can update their restaurant's orders
      const ownsRestaurant = await Restaurant.findOne({
        where: { id: order.restaurantId, ownerId: userId },
      });
      if (!ownsRestaurant) {
        throw new AuthorizationError('You do not own this restaurant');
      }
    }
    // ADMIN can update any order

    // Validate status transition
    this.validateStatusTransition(order.status, data.status);

    order.status = data.status;
    await order.save();

    return await this.getOrderById(order.id, userId, userRole);
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId: string, userId: string, userRole: string): Promise<Order> {
    return this.updateOrderStatus(orderId, userId, userRole, {
      status: OrderStatus.CANCELLED,
    });
  }

  /**
   * Validate order status transitions
   */
  private validateStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): void {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
      [OrderStatus.PREPARING]: [OrderStatus.READY, OrderStatus.CANCELLED],
      [OrderStatus.READY]: [OrderStatus.COMPLETED],
      [OrderStatus.COMPLETED]: [],
      [OrderStatus.CANCELLED]: [],
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new ValidationError(
        `Invalid status transition from ${currentStatus} to ${newStatus}`
      );
    }
  }
}

export default new OrderService();
import { Response, NextFunction } from 'express';
import orderService from '../services/order.service';
import { AuthenticatedRequest } from '../types';
import {
  CreateOrderInput,
  UpdateOrderStatusInput,
  ListOrdersQuery,
} from '../validators/order.validator';

export class OrderController {
  /**
   * POST /api/v1/orders
   * Create a new order
   */
  async createOrder(
    req: AuthenticatedRequest<CreateOrderInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const order = await orderService.createOrder(req.user!.id, req.body);

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: { order },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/orders/:id
   * Get order by ID
   */
  async getOrder(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const order = await orderService.getOrderById(
        req.params.id,
        req.user!.id,
        req.user!.role
      );

      res.status(200).json({
        success: true,
        data: { order },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/orders
   * List orders with filters
   */
  async listOrders(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const query = req.query as unknown as ListOrdersQuery;
      const result = await orderService.listOrders(req.user!.id, req.user!.role, query);

      res.status(200).json({
        success: true,
        data: {
          orders: result.orders,
          pagination: {
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: Math.ceil(result.total / result.limit),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/orders/:id/status
   * Update order status
   */
  async updateOrderStatus(
    req: AuthenticatedRequest<UpdateOrderStatusInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const order = await orderService.updateOrderStatus(
        req.params.id,
        req.user!.id,
        req.user!.role,
        req.body
      );

      res.status(200).json({
        success: true,
        message: 'Order status updated successfully',
        data: { order },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/orders/:id/cancel
   * Cancel order
   */
  async cancelOrder(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const order = await orderService.cancelOrder(
        req.params.id,
        req.user!.id,
        req.user!.role
      );

      res.status(200).json({
        success: true,
        message: 'Order cancelled successfully',
        data: { order },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new OrderController();
import { Router } from 'express';
import orderController from '../controllers/order.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createOrderSchema,
  updateOrderStatusSchema,
} from '../validators/order.validator';

const router = Router();

/**
 * @route   POST /api/v1/orders
 * @desc    Create a new order
 * @access  Private (Authenticated customers)
 */
router.post(
  '/',
  authenticate,
  validate(createOrderSchema),
  orderController.createOrder.bind(orderController)
);

/**
 * @route   GET /api/v1/orders
 * @desc    List orders (filtered by role)
 * @access  Private
 * @query   ?page=1&limit=20&status=PENDING&restaurantId=uuid&from=date&to=date
 */
router.get('/', authenticate, orderController.listOrders.bind(orderController));

/**
 * @route   GET /api/v1/orders/:id
 * @desc    Get order details
 * @access  Private (Owner/Restaurant/Admin)
 */
router.get('/:id', authenticate, orderController.getOrder.bind(orderController));

/**
 * @route   PATCH /api/v1/orders/:id/status
 * @desc    Update order status
 * @access  Private (Restaurant Owner/Admin)
 */
router.patch(
  '/:id/status',
  authenticate,
  validate(updateOrderStatusSchema),
  orderController.updateOrderStatus.bind(orderController)
);

/**
 * @route   POST /api/v1/orders/:id/cancel
 * @desc    Cancel order
 * @access  Private (Customer can cancel own, Restaurant/Admin can cancel any)
 */
router.post('/:id/cancel', authenticate, orderController.cancelOrder.bind(orderController));

export default router;
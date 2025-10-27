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
 * @openapi
 * /api/v1/orders:
 *   get:
 *     tags: [Orders]
 *     summary: List orders
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders
 *   post:
 *     tags: [Orders]
 *     summary: Create a new order
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Validation error
 */
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
 * @openapi
 * /api/v1/orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Get order details
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order
 *       404:
 *         description: Not found
 */
/**
 * @route   GET /api/v1/orders/:id
 * @desc    Get order details
 * @access  Private (Owner/Restaurant/Admin)
 */
router.get('/:id', authenticate, orderController.getOrder.bind(orderController));

/**
 * @openapi
 * /api/v1/orders/{id}/status:
 *   patch:
 *     tags: [Orders]
 *     summary: Update order status
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Updated
 *       400:
 *         description: Validation error
 *       404:
 *         description: Not found
 */
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
 * @openapi
 * /api/v1/orders/{id}/cancel:
 *   post:
 *     tags: [Orders]
 *     summary: Cancel an order
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cancelled
 *       404:
 *         description: Not found
 */
/**
 * @route   POST /api/v1/orders/:id/cancel
 * @desc    Cancel order
 * @access  Private (Customer can cancel own, Restaurant/Admin can cancel any)
 */
router.post('/:id/cancel', authenticate, orderController.cancelOrder.bind(orderController));

export default router;
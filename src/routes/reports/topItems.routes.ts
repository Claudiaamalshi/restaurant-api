import { Router } from 'express';
import topItemsController from '../../controllers/reports/topItems.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { UserRole } from '../../types';

const router = Router();

/**
 * @route   GET /api/v1/reports/top-items
 * @desc    Get top-selling items by quantity or revenue
 * @access  Private (Restaurant Owner, Admin)
 */
/**
 * @openapi
 * /api/v1/reports/top-items:
 *   get:
 *     tags: [Reports]
 *     summary: Get top-selling items
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [quantity, revenue]
 *     responses:
 *       200:
 *         description: Top items
 */
router.get(
  '/top-items',
  authenticate,
  authorize(UserRole.RESTAURANT_OWNER, UserRole.ADMIN),
  topItemsController.getTopItems.bind(topItemsController)
);

export default router;
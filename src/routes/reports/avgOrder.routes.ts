import { Router } from 'express';
import avgOrderController from '../../controllers/reports/avgOrder.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { UserRole } from '../../types';

const router = Router();

/**
 * @route   GET /api/v1/reports/average-order-value
 * @desc    Get average order value by period or overall
 * @access  Private (Restaurant Owner, Admin)
 */
/**
 * @openapi
 * /api/v1/reports/average-order-value:
 *   get:
 *     tags: [Reports]
 *     summary: Get average order value by period or overall
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: groupBy
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *     responses:
 *       200:
 *         description: Average order value report
 */
router.get(
  '/average-order-value',
  authenticate,
  authorize(UserRole.RESTAURANT_OWNER, UserRole.ADMIN),
  avgOrderController.getAvgOrderValue.bind(avgOrderController)
);

export default router;
import { Router } from 'express';
import salesController from '../../controllers/reports/sales.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { UserRole } from '../../types';

const router = Router();

/**
 * @route   GET /api/v1/reports/sales
 * @desc    Get total sales by period (day/week/month)
 * @access  Private (Restaurant Owner, Admin)
 * @query   from, to, groupBy, restaurantId, status, page, limit, sortBy, order
 */
/**
 * @openapi
 * /api/v1/reports/sales:
 *   get:
 *     tags: [Reports]
 *     summary: Get total sales by period (day/week/month)
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
 *         description: Sales report
 */
router.get(
  '/sales',
  authenticate,
  authorize(UserRole.RESTAURANT_OWNER, UserRole.ADMIN),
  salesController.getSalesReport.bind(salesController)
);

export default router;
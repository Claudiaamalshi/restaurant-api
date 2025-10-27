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
router.get(
  '/top-items',
  authenticate,
  authorize(UserRole.RESTAURANT_OWNER, UserRole.ADMIN),
  topItemsController.getTopItems.bind(topItemsController)
);

export default router;
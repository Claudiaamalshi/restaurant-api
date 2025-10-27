import { Router } from 'express';
import restaurantController from '../controllers/restaurant.controller';
import { validate } from '../middleware/validation.middleware';
import { createRestaurantSchema, updateRestaurantSchema } from '../validators/restaurant.validator';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../types';

const router = Router();

/**
 * @openapi
 * /api/v1/restaurants:
 *   get:
 *     tags: [Restaurants]
 *     summary: List restaurants
 *     responses:
 *       200:
 *         description: List of restaurants
 *   post:
 *     tags: [Restaurants]
 *     summary: Create a restaurant
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Restaurant created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
// Create restaurant (auth required)
router.post('/', authenticate, authorize(UserRole.RESTAURANT_OWNER, UserRole.ADMIN), validate(createRestaurantSchema), restaurantController.create);

// Get all restaurants
router.get('/', restaurantController.findAll);

/**
 * @openapi
 * /api/v1/restaurants/{id}:
 *   get:
 *     tags: [Restaurants]
 *     summary: Get a restaurant by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Restaurant found
 *       404:
 *         description: Not found
 *   patch:
 *     tags: [Restaurants]
 *     summary: Update a restaurant
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 *   delete:
 *     tags: [Restaurants]
 *     summary: Delete a restaurant
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       204:
 *         description: Deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
// Get one by ID
router.get('/:id', restaurantController.findOne);

// Update restaurant
router.patch('/:id', authenticate, authorize(UserRole.RESTAURANT_OWNER, UserRole.ADMIN), validate(updateRestaurantSchema), restaurantController.update);

// Delete restaurant (soft delete)
router.delete('/:id', authenticate, authorize(UserRole.RESTAURANT_OWNER, UserRole.ADMIN), restaurantController.delete);

export default router;

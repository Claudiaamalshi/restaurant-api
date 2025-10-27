import { Router } from 'express';
import dishController from '../controllers/dish.controller';
import { validate } from '../middleware/validation.middleware';
import { createDishSchema, updateDishSchema } from '../validators/dish.schema';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../types';
import { createRatingSchema } from '../validators/rating.schema';

const router = Router();

/**
 * @openapi
 * /api/v1/categories/{categoryId}/dishes:
 *   get:
 *     tags: [Dishes]
 *     summary: List dishes in a category
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of dishes
 *   post:
 *     tags: [Dishes]
 *     summary: Create a dish in a category
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Created
 *       401:
 *         description: Unauthorized
 */
// Create dish — only Restaurant Owner or Admin
router.post(
  '/categories/:categoryId/dishes',
  authenticate,
  authorize(UserRole.RESTAURANT_OWNER, UserRole.ADMIN),
  validate(createDishSchema),
  dishController.create
);

// Get all dishes by category
router.get('/categories/:categoryId/dishes', dishController.getAll);

/**
 * @openapi
 * /api/v1/categories/{categoryId}/dishes/{id}:
 *   get:
 *     tags: [Dishes]
 *     summary: Get dish by ID within a category
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dish
 *       404:
 *         description: Not found
 *   put:
 *     tags: [Dishes]
 *     summary: Update a dish
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 *   delete:
 *     tags: [Dishes]
 *     summary: Delete a dish
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
// Get dish by ID
router.get('/categories/:categoryId/dishes/:id', dishController.getOne);

// Update dish — only Restaurant Owner or Admin
router.put(
  '/categories/:categoryId/dishes/:id',
  authenticate,
  authorize(UserRole.RESTAURANT_OWNER, UserRole.ADMIN),
  validate(updateDishSchema),
  dishController.update
);

// Delete dish — only Restaurant Owner or Admin
router.delete(
  '/categories/:categoryId/dishes/:id',
  authenticate,
  authorize(UserRole.RESTAURANT_OWNER, UserRole.ADMIN),
  dishController.delete
);

/**
 * @openapi
 * /api/v1/dishes/{id}/ratings:
 *   post:
 *     tags: [Dishes]
 *     summary: Rate a dish
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Rated
 *       401:
 *         description: Unauthorized
 */
// POST /dishes/:id/ratings — only customers can rate
router.post(
  '/dishes/:id/ratings',
  authenticate,
  authorize(UserRole.CUSTOMER),
  validate(createRatingSchema),
  dishController.rate
);

export default router;

import { Router } from 'express';
import dishController from '../controllers/dish.controller';
import { validate } from '../middleware/validation.middleware';
import { createDishSchema, updateDishSchema } from '../validators/dish.schema';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../types';
import { createRatingSchema } from '../validators/rating.schema';

const router = Router();

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

// POST /dishes/:id/ratings — only customers can rate
router.post(
  '/dishes/:id/ratings',
  authenticate,
  authorize(UserRole.CUSTOMER),
  validate(createRatingSchema),
  dishController.rate
);

export default router;

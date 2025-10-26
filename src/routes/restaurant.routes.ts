import { Router } from 'express';
import restaurantController from '../controllers/restaurant.controller';
import { validate } from '../middleware/validation.middleware';
import { createRestaurantSchema, updateRestaurantSchema } from '../validators/restaurant.validator';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../types';

const router = Router();

// Create restaurant (auth required)
router.post('/', authenticate, authorize(UserRole.RESTAURANT_OWNER, UserRole.ADMIN), validate(createRestaurantSchema), restaurantController.create);

// Get all restaurants
router.get('/', restaurantController.findAll);

// Get one by ID
router.get('/:id', restaurantController.findOne);

// Update restaurant
router.patch('/:id', authenticate, authorize(UserRole.RESTAURANT_OWNER, UserRole.ADMIN), validate(updateRestaurantSchema), restaurantController.update);

// Delete restaurant (soft delete)
router.delete('/:id', authenticate, authorize(UserRole.RESTAURANT_OWNER, UserRole.ADMIN), restaurantController.delete);

export default router;

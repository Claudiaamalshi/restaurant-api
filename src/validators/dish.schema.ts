import { z } from 'zod';

export const createDishSchema = z.object({
  name: z.string().min(1, 'Dish name is required'),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  imageUrl: z.string().url().optional(),
  isAvailable: z.boolean().optional(),
  calories: z.number().optional(),
});

export const updateDishSchema = createDishSchema.partial();

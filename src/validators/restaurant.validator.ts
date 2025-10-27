import { z } from 'zod';

export const createRestaurantSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  openingHours: z.record(z.string(), z.string()).optional(),
  cuisineType: z.string().optional(),
  priceRange: z.enum(['BUDGET', 'MODERATE', 'EXPENSIVE']).optional(),
  imageUrl: z.string().url().optional(),
  logoUrl: z.string().url().optional(),
});

export const updateRestaurantSchema = createRestaurantSchema.partial();

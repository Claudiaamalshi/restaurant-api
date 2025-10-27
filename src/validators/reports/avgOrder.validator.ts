import { z } from 'zod';

export const avgOrderValueSchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  groupBy: z.enum(['day', 'week', 'month', 'overall']).default('overall').optional(),
  restaurantId: z.string().uuid().optional(),
  status: z
    .string()
    .optional()
    .transform(val => val?.split(',').filter(Boolean))
    .optional(),
  page: z.coerce.number().int().positive().default(1).optional(),
  limit: z.coerce.number().int().positive().max(100).default(20).optional(),
  sortBy: z.enum(['period', 'averageOrderValue', 'orderCount']).default('period').optional(),
  order: z.enum(['asc', 'desc']).default('asc').optional(),
});

export type AvgOrderValueQuery = z.infer<typeof avgOrderValueSchema>;
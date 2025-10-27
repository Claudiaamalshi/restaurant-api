import { z } from 'zod';

export const topItemsReportSchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(10).optional(),
  sortBy: z.enum(['quantity', 'revenue']).default('revenue').optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  restaurantId: z.string().uuid().optional(),
  status: z
    .string()
    .optional()
    .transform(val => val?.split(',').filter(Boolean))
    .optional(),
  page: z.coerce.number().int().positive().default(1).optional(),
  pageLimit: z.coerce.number().int().positive().max(100).default(20).optional(),
});

export type TopItemsReportQuery = z.infer<typeof topItemsReportSchema>;
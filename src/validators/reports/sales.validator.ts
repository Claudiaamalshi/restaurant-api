import { z } from 'zod';

export const salesReportSchema = z.object({
  from: z.string().datetime('Invalid from date format'),
  to: z.string().datetime('Invalid to date format'),
  groupBy: z.enum(['day', 'week', 'month'], {
    errorMap: () => ({ message: 'groupBy must be day, week, or month' }),
  }),
  restaurantId: z.string().uuid('Invalid restaurant ID').optional(),
  status: z
    .string()
    .optional()
    .transform(val => val?.split(',').filter(Boolean))
    .optional(),
  page: z.coerce.number().int().positive().default(1).optional(),
  limit: z.coerce.number().int().positive().max(100).default(20).optional(),
  sortBy: z.enum(['period', 'totalSales', 'orderCount']).default('period').optional(),
  order: z.enum(['asc', 'desc']).default('asc').optional(),
});

export type SalesReportQuery = z.infer<typeof salesReportSchema>;
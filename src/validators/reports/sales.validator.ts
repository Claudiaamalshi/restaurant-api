import { z } from 'zod';

export const salesReportSchema = z.object({
  from: z.string().refine(val => /^\d{4}-\d{2}-\d{2}$/.test(val), {
    message: 'from must be in YYYY-MM-DD format',
  }),
  to: z.string().refine(val => /^\d{4}-\d{2}-\d{2}$/.test(val), {
    message: 'to must be in YYYY-MM-DD format',
  }),
  groupBy: z.enum(['day', 'week', 'month']),
  restaurantId: z.string().uuid().optional(),
  status: z.string().optional().transform(val => val?.split(',').filter(Boolean)),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['period', 'totalSales', 'orderCount']).default('period'),
  order: z.enum(['asc', 'desc']).default('asc'),
});

export type SalesReportQuery = z.infer<typeof salesReportSchema>;
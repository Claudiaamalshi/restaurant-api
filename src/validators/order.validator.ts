import { z } from 'zod';
import { OrderStatus } from '../types';

export const createOrderSchema = z.object({
  restaurantId: z.string().uuid('Invalid restaurant ID'),
  items: z
    .array(
      z.object({
        dishId: z.string().uuid('Invalid dish ID'),
        quantity: z
          .number()
          .int('Quantity must be an integer')
          .positive('Quantity must be positive')
          .max(100, 'Maximum quantity is 100'),
      })
    )
    .min(1, 'Order must contain at least one item')
    .max(50, 'Maximum 50 items per order'),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus, {
    errorMap: () => ({ message: 'Invalid order status' }),
  }),
});

export const listOrdersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1).optional(),
  limit: z.coerce.number().int().positive().max(100).default(20).optional(),
  status: z.nativeEnum(OrderStatus).optional(),
  restaurantId: z.string().uuid().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  sortBy: z.enum(['createdAt', 'totalAmount', 'status']).default('createdAt').optional(),
  order: z.enum(['asc', 'desc']).default('desc').optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type ListOrdersQuery = z.infer<typeof listOrdersQuerySchema>;
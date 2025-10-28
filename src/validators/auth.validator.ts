import { z } from 'zod';
import { UserRole } from '../types';

// Utility: transform role input to uppercase (if provided)
const normalizeRole = (role: unknown): UserRole | undefined => {
  if (typeof role === 'string') {
    const upper = role.toUpperCase();
    if (Object.values(UserRole).includes(upper as UserRole)) {
      return upper as UserRole;
    }
  }
  return undefined;
};

export const registerSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email format')
    .toLowerCase()
    .trim(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  role: z
    .preprocess(
      (val) => normalizeRole(val),
      z.nativeEnum(UserRole, { errorMap: () => ({ message: 'Invalid role' }) })
    )
    .optional()
    .default(UserRole.CUSTOMER)
    // Prevent ADMIN role through validation layer
    .refine((role: UserRole) => role !== UserRole.ADMIN, {
      message: 'Admin registration is restricted',
    }),
});

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email format')
    .toLowerCase()
    .trim(),
  password: z.string({ required_error: 'Password is required' }),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string({ required_error: 'Refresh token is required' }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
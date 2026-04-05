import { z } from 'zod';

export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be under 50 characters')
    .trim()
    .optional(),

  email: z
    .string()
    .email('Invalid email format')
    .toLowerCase()
    .trim()
    .optional(),

  isActive: z
    .boolean({ invalid_type_error: 'isActive must be true or false' })
    .optional(),
});

export const updateRoleSchema = z.object({
  role: z.enum(['VIEWER', 'ANALYST', 'ADMIN'], {
    errorMap: () => ({ message: 'Role must be VIEWER, ANALYST or ADMIN' }),
  }),
});

export const getUsersQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform(Number)
    .pipe(z.number().min(1, 'Page must be at least 1')),

  limit: z
    .string()
    .optional()
    .default('10')
    .transform(Number)
    .pipe(z.number().min(1).max(100, 'Limit cannot exceed 100')),

  role: z
    .enum(['VIEWER', 'ANALYST', 'ADMIN'])
    .optional(),

  isActive: z
    .enum(['true', 'false'])
    .optional()
    .transform((val) => (val === undefined ? undefined : val === 'true')),

  search: z
    .string()
    .optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type GetUsersQuery = z.infer<typeof getUsersQuerySchema>;
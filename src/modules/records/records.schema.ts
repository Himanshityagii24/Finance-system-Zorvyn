import { z } from 'zod';

export const createRecordSchema = z.object({
  amount: z
    .number({ required_error: 'Amount is required', invalid_type_error: 'Amount must be a number' })
    .positive('Amount must be greater than 0')
    .multipleOf(0.01, 'Amount can have max 2 decimal places'),

  type: z.enum(['INCOME', 'EXPENSE'], {
    errorMap: () => ({ message: 'Type must be INCOME or EXPENSE' }),
  }),

  category: z
    .string({ required_error: 'Category is required' })
    .min(1, 'Category cannot be empty')
    .max(50, 'Category must be under 50 characters')
    .trim(),

  date: z
    .string({ required_error: 'Date is required' })
    .datetime({ message: 'Date must be a valid ISO date string e.g. 2024-01-15T00:00:00.000Z' }),

  notes: z
    .string()
    .max(500, 'Notes must be under 500 characters')
    .trim()
    .optional(),
});

export const updateRecordSchema = z.object({
  amount: z
    .number({ invalid_type_error: 'Amount must be a number' })
    .positive('Amount must be greater than 0')
    .multipleOf(0.01, 'Amount can have max 2 decimal places')
    .optional(),

  type: z
    .enum(['INCOME', 'EXPENSE'], {
      errorMap: () => ({ message: 'Type must be INCOME or EXPENSE' }),
    })
    .optional(),

  category: z
    .string()
    .min(1, 'Category cannot be empty')
    .max(50, 'Category must be under 50 characters')
    .trim()
    .optional(),

  date: z
    .string()
    .datetime({ message: 'Date must be a valid ISO date string' })
    .optional(),

  notes: z
    .string()
    .max(500, 'Notes must be under 500 characters')
    .trim()
    .optional(),
});

export const getRecordsQuerySchema = z.object({
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

  type: z
    .enum(['INCOME', 'EXPENSE'])
    .optional(),

  category: z
    .string()
    .optional(),

  search: z
    .string()
    .optional(),

  from: z
    .string()
    .datetime({ message: 'from must be a valid ISO date' })
    .optional(),

  to: z
    .string()
    .datetime({ message: 'to must be a valid ISO date' })
    .optional(),

  sortBy: z
    .enum(['date', 'amount', 'createdAt'])
    .optional()
    .default('date'),

  sortOrder: z
    .enum(['asc', 'desc'])
    .optional()
    .default('desc'),
});

export type CreateRecordInput = z.infer<typeof createRecordSchema>;
export type UpdateRecordInput = z.infer<typeof updateRecordSchema>;
export type GetRecordsQuery = z.infer<typeof getRecordsQuerySchema>;
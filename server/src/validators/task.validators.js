import { z } from 'zod';
import { STATUSES, PRIORITIES } from '../models/Task.js';

const base = z.object({
  title: z.string().trim().min(1, 'Title is required').max(120, 'Title must be 120 characters or fewer'),
  description: z.string().trim().max(1000, 'Description must be 1000 characters or fewer').default(''),
  status: z.enum(STATUSES).default('pending'),
  priority: z.enum(PRIORITIES).default('medium'),
  dueDate: z.coerce.date({ invalid_type_error: 'Due date is not a valid date' }).nullable().default(null),
});

export const createTaskSchema = base;

export const updateTaskSchema = base
  .partial()
  .refine((d) => Object.keys(d).length > 0, { message: 'Provide at least one field to update' });

export const statusSchema = z.object({ status: z.enum(STATUSES) });

export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(8),
  status: z.enum(STATUSES).optional(),
  priority: z.enum(PRIORITIES).optional(),
  search: z.string().trim().max(100).optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'dueDate', 'title']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

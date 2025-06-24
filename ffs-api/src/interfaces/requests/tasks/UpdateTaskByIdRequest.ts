import { z } from 'zod';

export const UpdateTaskByIdRequestSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number')
  }),
  body: z.object({
    title: z.string().min(1, 'Title is required').optional(),
    due_date: z.string().optional(),
    assigned_to: z.number().int().positive().optional(),
    is_completed: z.boolean().optional()
  })
});

export type UpdateTaskByIdRequest = z.infer<typeof UpdateTaskByIdRequestSchema>;

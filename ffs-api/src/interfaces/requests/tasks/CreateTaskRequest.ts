import { z } from 'zod';

export const CreateTaskRequestSchema = z.object({
  title: z.string().min(1, { message: 'title is required' }),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'due_date must be in YYYY-MM-DD format' }),
  assigned_to: z.number().int({ message: 'assigned_to must be an integer' }),
  is_completed: z.boolean().optional().default(false),
});

export type CreateTaskRequest = z.infer<typeof CreateTaskRequestSchema>;

import { z } from 'zod';

export const UpdateTaskRequestSchema = z.object({
  title: z.string().min(1, { message: 'title is required' }).optional(),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'due_date must be in YYYY-MM-DD format' }).optional(),
  assigned_to: z.number().int({ message: 'assigned_to must be an integer' }).optional(),
  is_completed: z.boolean().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update'
});

export type UpdateTaskRequest = z.infer<typeof UpdateTaskRequestSchema>;

import { z } from 'zod';

export const UpdateCategoryByIdRequestSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number')
  }),
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional()
  })
});

export type UpdateCategoryByIdRequest = z.infer<typeof UpdateCategoryByIdRequestSchema>;

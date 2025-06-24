import { z } from 'zod';

export const CreateCategoryWithValidationRequestSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional()
  })
});

export type CreateCategoryWithValidationRequest = z.infer<typeof CreateCategoryWithValidationRequestSchema>;

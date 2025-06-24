import { z } from 'zod';

export const DeleteCategoryByIdRequestSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number')
  })
});

export type DeleteCategoryByIdRequest = z.infer<typeof DeleteCategoryByIdRequestSchema>;

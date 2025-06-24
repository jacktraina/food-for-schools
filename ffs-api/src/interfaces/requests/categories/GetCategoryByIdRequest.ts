import { z } from 'zod';

export const GetCategoryByIdRequestSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number')
  })
});

export type GetCategoryByIdRequest = z.infer<typeof GetCategoryByIdRequestSchema>;

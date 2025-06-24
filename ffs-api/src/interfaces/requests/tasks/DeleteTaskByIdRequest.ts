import { z } from 'zod';

export const DeleteTaskByIdRequestSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number')
  })
});

export type DeleteTaskByIdRequest = z.infer<typeof DeleteTaskByIdRequestSchema>;

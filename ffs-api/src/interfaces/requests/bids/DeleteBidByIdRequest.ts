import { z } from 'zod';

export const DeleteBidByIdRequestSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number')
  })
});

export type DeleteBidByIdRequest = z.infer<typeof DeleteBidByIdRequestSchema>;

import { z } from 'zod';

export const DeleteBidItemByIdRequestSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number')
  })
});

export type DeleteBidItemByIdRequest = z.infer<typeof DeleteBidItemByIdRequestSchema>;

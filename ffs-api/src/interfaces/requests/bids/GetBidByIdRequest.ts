import { z } from 'zod';

export const GetBidByIdRequestSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number')
  })
});

export type GetBidByIdRequest = z.infer<typeof GetBidByIdRequestSchema>;

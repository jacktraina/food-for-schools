import { z } from 'zod';

export const GetBidsByCooperativeIdRequestSchema = z.object({
  params: z.object({
    cooperativeId: z.string().regex(/^\d+$/, 'Cooperative ID must be a number')
  })
});

export type GetBidsByCooperativeIdRequest = z.infer<typeof GetBidsByCooperativeIdRequestSchema>;

import { z } from 'zod';

export const GetBidsForBidManagerRequestSchema = z.object({
  params: z.object({
    bidManagerId: z.string().regex(/^\d+$/, 'Bid Manager ID must be a number')
  })
});

export type GetBidsForBidManagerRequest = z.infer<typeof GetBidsForBidManagerRequestSchema>;

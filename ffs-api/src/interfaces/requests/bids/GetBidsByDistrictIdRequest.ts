import { z } from 'zod';

export const GetBidsByDistrictIdRequestSchema = z.object({
  params: z.object({
    districtId: z.string().regex(/^\d+$/, 'District ID must be a number')
  })
});

export type GetBidsByDistrictIdRequest = z.infer<typeof GetBidsByDistrictIdRequestSchema>;

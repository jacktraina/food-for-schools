import { z } from 'zod';

export const GetDistrictDetailsRequestSchema = z.object({
  params: z.object({
    districtId: z.string().regex(/^\d+$/, { message: 'District ID must be a valid number' }),
  }),
});

export type GetDistrictDetailsRequest = z.infer<typeof GetDistrictDetailsRequestSchema>;

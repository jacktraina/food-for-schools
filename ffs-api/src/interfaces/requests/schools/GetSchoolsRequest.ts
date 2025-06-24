import { z } from 'zod';

export const GetSchoolsRequestSchema = z.object({
  params: z.object({
    districtId: z.string().transform(val => parseInt(val, 10)).refine(val => !isNaN(val), {
      message: 'District ID must be a valid number'
    })
  })
});

export type GetSchoolsRequest = z.infer<typeof GetSchoolsRequestSchema>;

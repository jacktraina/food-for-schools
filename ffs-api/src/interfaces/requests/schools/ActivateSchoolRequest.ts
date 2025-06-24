import { z } from 'zod';

export const ActivateSchoolRequestSchema = z.object({
  params: z.object({
    districtId: z.string().regex(/^\d+$/, 'District ID must be a number'),
    id: z.string().regex(/^\d+$/, 'School ID must be a number')
  })
});

export type ActivateSchoolRequest = z.infer<typeof ActivateSchoolRequestSchema>;

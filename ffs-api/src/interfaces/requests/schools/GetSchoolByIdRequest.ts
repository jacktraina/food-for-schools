import { z } from 'zod';

export const GetSchoolByIdRequestSchema = z.object({
  params: z.object({
    districtId: z.string().transform(val => parseInt(val, 10)).refine(val => !isNaN(val), {
      message: 'District ID must be a valid number'
    }),
    schoolId: z.string().transform(val => parseInt(val, 10)).refine(val => !isNaN(val), {
      message: 'School ID must be a valid number'
    })
  })
});

export type GetSchoolByIdRequest = z.infer<typeof GetSchoolByIdRequestSchema>;

import { z } from "zod";

export const DeleteDistrictRequestSchema = z.object({
  params: z.object({
    districtId: z
      .string()
      .regex(/^\d+$/, { message: 'District ID must be a valid number' }),
  }),
});

export type DeleteDistrictRequest = z.infer<typeof DeleteDistrictRequestSchema>;
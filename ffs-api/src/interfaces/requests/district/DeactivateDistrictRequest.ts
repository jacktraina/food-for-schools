import { z } from "zod";

export const DeactivateDistrictRequestSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^\d+$/, { message: 'District ID must be a valid number' }),
  }),
});

export type DeactivateDistrictRequest = z.infer<typeof DeactivateDistrictRequestSchema>;
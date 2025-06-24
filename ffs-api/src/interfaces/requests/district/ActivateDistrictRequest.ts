import { z } from "zod";

export const ActivateDistrictRequestSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^\d+$/, { message: 'District ID must be a valid number' }),
  }),
});

export type ActivateDistrictRequest = z.infer<typeof ActivateDistrictRequestSchema>;

import { z } from "zod";

export const DeactivateUserRequestSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^\d+$/, { message: 'User ID must be a valid number' }),
  }),
});

export type DeactivateUserRequest = z.infer<typeof DeactivateUserRequestSchema>;

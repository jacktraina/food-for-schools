import { z } from "zod";

export const ActivateUserRequestSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^\d+$/, { message: 'User ID must be a valid number' }),
  }),
});

export type ActivateUserRequest = z.infer<typeof ActivateUserRequestSchema>;

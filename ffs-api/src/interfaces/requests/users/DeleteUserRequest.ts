import { z } from "zod";

export const DeleteUserRequestSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^\d+$/, { message: 'User ID must be a valid number' }),
  }),
});

export type DeleteUserRequest = z.infer<typeof DeleteUserRequestSchema>;

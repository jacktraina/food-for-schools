import { z } from 'zod';

export const PasswordResetCodeRequestSchema = z.object({
  email: z.string().email('Invalid email format')
});

export type PasswordResetCodeRequest = z.infer<typeof PasswordResetCodeRequestSchema>;

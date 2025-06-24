import { z } from 'zod';

export const VerifyEmailRequestSchema = z.object({
  email: z.string().email('Invalid email format'),
  code: z.string().min(1, 'Code is required'),
});

export type VerifyEmailRequest = z.infer<typeof VerifyEmailRequestSchema>;

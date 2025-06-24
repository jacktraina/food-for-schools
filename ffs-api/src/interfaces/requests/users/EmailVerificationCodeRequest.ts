import { z } from 'zod';

export const EmailVerificationCodeRequestSchema = z.object({
  email: z.string().email('Invalid email format')
});

export type EmailVerificationCodeRequest = z.infer<typeof EmailVerificationCodeRequestSchema>;

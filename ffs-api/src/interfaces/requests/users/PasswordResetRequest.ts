import { z } from 'zod';

export const PasswordResetRequestSchema = z.object({
  email: z.string().email('Invalid email format'),
  code: z.string().min(1, 'Code is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(64, 'Password must not exceed 64 characters')
    .regex(/[A-Z]/, 'Password must include at least one uppercase letter')
    .regex(/[a-z]/, 'Password must include at least one lowercase letter')
    .regex(/[0-9]/, 'Password must include at least one digit')
    .regex(
      /[!@#$%^&*(),.?":{}|<>]/,
      'Password must include at least one special character'
    ),
});

export type PasswordResetRequest = z.infer<typeof PasswordResetRequestSchema>;

import { z } from 'zod';

export const AcceptOrganizationInviteRequestSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  token: z.string().min(1, 'Token is required'),
});

export type AcceptOrganizationInviteRequest = z.infer<typeof AcceptOrganizationInviteRequestSchema>;

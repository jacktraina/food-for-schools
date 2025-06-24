import { z } from 'zod';

export const InviteOrganizationRequestSchema = z.object({
  email: z.string().email('Invalid email format'),
  organization_type: z.enum(['Coop', 'Single-District'], {
    errorMap: () => ({ message: 'Invalid organization type. Must be one of: Coop, Single-District' })
  }),
  name: z.string().min(1, 'Organization name is required')
});

export type InviteOrganizationRequest = z.infer<typeof InviteOrganizationRequestSchema>;

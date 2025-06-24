import { z } from 'zod';

export const UpdateOrganizationRequestSchema = z.object({
  streetAddress1: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  zipCode: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().email('Invalid email format').nullable().optional()
});

export type UpdateOrganizationRequest = z.infer<typeof UpdateOrganizationRequestSchema>;

import { z } from 'zod';

export const GetBidsForOrganizationRequestSchema = z.object({
  params: z.object({
    organizationId: z.string().regex(/^\d+$/, 'Organization ID must be a number')
  })
});

export type GetBidsForOrganizationRequest = z.infer<typeof GetBidsForOrganizationRequestSchema>;

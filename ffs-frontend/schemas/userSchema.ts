import { z } from 'zod';

export const UpdateUserRequestDataSchema = z.object({
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  email: z.string().email('Invalid email format').optional(),
  role: z
    .enum([
      'Super-Admin',
      'Group Admin',
      'District Admin',
      'School Admin',
      'Viewer',
    ])
    .optional(),
  bidRole: z.enum(['Bid Administrator', 'Bid Viewer']).optional(),
  districtId: z.number().int().positive().optional(),
  schoolId: z.number().int().positive().optional(),
  managedBids: z.array(z.string()).optional(),
});

export type UpdateUserRequestData = z.infer<typeof UpdateUserRequestDataSchema>;

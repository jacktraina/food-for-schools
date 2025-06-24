import { z } from 'zod';

export const InviteUserRequestSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email format'),
  role: z.enum(['Super-Admin', 'Group Admin', 'District Admin', 'School Admin', 'Viewer'], {
    errorMap: () => ({ message: 'Invalid role. Must be one of: Super-Admin, Group Admin, District Admin, School Admin, Viewer' })
  }),
  bid_role: z.enum(['Bid Administrator', 'Bid Viewer'], {
    errorMap: () => ({ message: 'Invalid bid role. Must be one of: Bid Administrator, Bid Viewer' })
  }).optional(),
  district_id: z.number().int().positive().optional(),
  school_id: z.number().int().positive().optional()
});

export type InviteUserRequest = z.infer<typeof InviteUserRequestSchema>;

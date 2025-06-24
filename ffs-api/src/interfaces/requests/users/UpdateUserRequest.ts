import { z } from 'zod';

export const UpdateUserRequestDataSchema = z.object({
  firstName: z.string().min(1, 'First name is required').nullish(),
  lastName: z.string().min(1, 'Last name is required').nullish(),
  email: z.string().email('Invalid email format').nullish(),
  role: z.enum(['Super-Admin', 'Group Admin', 'District Admin', 'School Admin', 'Viewer']).nullish(),
  bidRole: z.enum(['Bid Administrator', 'Bid Viewer']).nullish(),
  districtId: z.number().int().positive().nullish(),
  schoolId: z.number().int().positive().nullish(),
  managedBids: z.array(z.string()).nullish(),
});

export const UpdateUserRequestSchema = z.object({
  params: z.object({
    userId: z
      .string()
      .regex(/^\d+$/, { message: 'User ID must be a valid number' }),
  }),
  body: UpdateUserRequestDataSchema,
});

export type UpdateUserRequest = z.infer<typeof UpdateUserRequestSchema>;
export type UpdateUserRequestData = z.infer<typeof UpdateUserRequestDataSchema>;

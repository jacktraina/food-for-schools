import { z } from 'zod';

export const RegisterVendorRequestSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  organizationId: z.number().int().positive('Organization ID must be a positive integer'),
  organizationType: z.enum(['cooperative', 'district'], {
    errorMap: () => ({ message: 'Organization type must be either cooperative or district' })
  })
});

export type RegisterVendorRequest = z.infer<typeof RegisterVendorRequestSchema>;

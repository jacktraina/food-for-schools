import { z } from 'zod';

export const CreateDistrictRequestSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  location: z.string().optional(),
  directorName: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email({ message: 'Invalid email' }).optional(),
  fax: z.string().optional(),
  website: z.string().url({ message: 'Invalid website URL' }).optional(),
  enrollment: z
    .number()
    .int()
    .nonnegative({ message: 'Must be a non-negative integer' })
    .optional(),
  raNumber: z.string().optional(),
  contact2: z.string().optional(),
  contact2Phone: z.string().optional(),
  contact2Email: z
    .string()
    .email({ message: 'Invalid email' })
    .optional(),
  billingContact: z.string().optional(),
  billingAddressLine1: z.string().optional(),
  billingAddressLine2: z.string().optional(),
  billingCity: z.string().optional(),
  billingState: z.string().optional(),
  billingZipCode: z.string().optional(),
  billingPhone: z.string().optional(),
  billingEmail: z
    .string()
    .email({ message: 'Invalid email' })
    .optional(),
  superintendent: z.string().optional(),
  established: z.string().optional(),
  status: z.string().optional(),
  budget: z.string().optional(),
  schools: z.number().int().nonnegative().optional(),
  students: z.number().int().nonnegative().optional(),
  participatingIn: z.array(z.string()).optional(),
  address: z.string().optional(),
  billingAddress: z.string().optional(),
  products: z
    .array(z.string({ required_error: 'Each product must be a string' }))
    .optional(),
});

export type CreateDistrictRequest = z.infer<typeof CreateDistrictRequestSchema>;

import { z } from 'zod';

export const CreateSchoolRequestSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  enrollment: z.number().optional(),
  schoolType: z.enum(['High School', 'Middle School', 'Elementary School', 'Childcare'], {
    required_error: 'School type is required'
  }),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  shippingAddressLine1: z.string().optional(),
  shippingAddressLine2: z.string().optional(),
  shippingAddressCity: z.string().optional(),
  shippingAddressState: z.string().optional(),
  shippingAddressZipCode: z.string().optional(),
  schoolContactName: z.string().optional(),
  schoolContactPhone: z.string().optional(),
  schoolContactEmail: z.string().email().optional(),
  notes: z.string().optional(),
  overrideDistrictBilling: z.boolean(),
  phone: z.string().optional(),
  fax: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  contactFirstName: z.string().optional(),
  contactLastName: z.string().optional(),
  contactTitle: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email().optional(),
  billingContact: z.string().optional(),
  billingPhone: z.string().optional(),
  billingEmail: z.string().email().optional(),
  billingAddressLine1: z.string().optional(),
  billingAddressLine2: z.string().optional(),
  billingCity: z.string().optional(),
  billingState: z.string().optional(),
  billingZipCode: z.string().optional()
});

export type CreateSchoolRequest = z.infer<typeof CreateSchoolRequestSchema>;

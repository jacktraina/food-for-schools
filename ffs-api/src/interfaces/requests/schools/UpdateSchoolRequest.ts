import { z } from 'zod';

export const UpdateSchoolRequestSchema = z
  .object({
    name: z.string().min(1, 'Name is required').optional(),
    enrollment: z.number().optional(),
    school_type: z
      .enum(['High School', 'Middle School', 'Elementary School', 'Childcare'], {
        errorMap: () => ({
          message:
            'School type must be one of: High School, Middle School, Elementary School, Childcare',
        }),
      })
      .optional(),
    address_line_1: z.string().optional(),
    address_line_2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip_code: z.string().optional(),
    shipping_address_line_1: z.string().optional(),
    shipping_address_line_2: z.string().optional(),
    shipping_address_city: z.string().optional(),
    shipping_address_state: z.string().optional(),
    shipping_address_zip_code: z.string().optional(),
    school_contact_name: z.string().optional(),
    school_contact_phone: z.string().optional(),
    school_contact_email: z.string().email().optional(),
    notes: z.string().optional(),
    override_district_billing: z.boolean().optional(),
    contact_first_name: z.string().optional(),
    contact_last_name: z.string().optional(),
    contact_title: z.string().optional(),
    contact_phone: z.string().optional(),
    contact_email: z.string().email().optional(),
    billing_contact: z.string().optional(),
    billing_phone: z.string().optional(),
    billing_email: z.string().email().optional(),
    billing_address_line_1: z.string().optional(),
    billing_address_line_2: z.string().optional(),
    billing_city: z.string().optional(),
    billing_state: z.string().optional(),
    billing_zip_code: z.string().optional(),
    fax: z.string().optional(),
    shippingInstructions: z.string().optional(),
    shippingDeliveryHours: z.string().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

export type UpdateSchoolRequest = z.infer<typeof UpdateSchoolRequestSchema>;

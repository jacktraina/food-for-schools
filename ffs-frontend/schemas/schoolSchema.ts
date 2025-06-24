import { GetSchoolDetailsResponse } from '@/types/school';
import * as z from 'zod';

export const schoolTypeSchema = z.enum(
  ['High School', 'Middle School', 'Elementary School', 'Childcare'],
  {
    required_error: 'School type is required',
  }
);

export const schoolFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  enrollment: z.coerce
    .number()
    .int()
    .min(0, { message: 'Enrollment must be a positive number' })
    .optional(),
  schoolType: schoolTypeSchema,

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
  schoolContactEmail: z.string().email().optional().or(z.literal('')),

  notes: z.string().optional(),

  overrideDistrictBilling: z.boolean().default(false),

  useSchoolAddressForShipping: z.boolean().default(false),

  phone: z.string().optional(),
  fax: z.string().optional(),
  email: z.string().optional(),
  website: z.string().optional(),
  contactFirstName: z.string().optional(),
  contactLastName: z.string().optional(),
  contactTitle: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().optional(),

  billingContact: z.string().optional(),
  billingPhone: z.string().optional(),
  billingEmail: z.string().email().optional().or(z.literal('')),
  billingAddressLine1: z.string().optional(),
  billingAddressLine2: z.string().optional(),
  billingCity: z.string().optional(),
  billingState: z.string().optional(),
  billingZipCode: z.string().optional(),
});

// Conditional validation based on form state
export const schoolFormSchemaWithConditionals = schoolFormSchema.superRefine(
  (data, ctx) => {
    // If not using school address for shipping, shipping address is required
    if (!data.useSchoolAddressForShipping) {
      if (!data.shippingAddressLine1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'Shipping address line 1 is required when not using school address',
          path: ['shippingAddressLine1'],
        });
      }
      if (!data.shippingAddressCity) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Shipping city is required when not using school address',
          path: ['shippingAddressCity'],
        });
      }
      if (!data.shippingAddressState) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Shipping state is required when not using school address',
          path: ['shippingAddressState'],
        });
      }
      if (!data.shippingAddressZipCode) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'Shipping ZIP code is required when not using school address',
          path: ['shippingAddressZipCode'],
        });
      }
    }

    // If overriding billing info, billing fields are required
    if (data.overrideDistrictBilling) {
      if (!data.billingContact) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'Billing contact is required when overriding district billing',
          path: ['billingContact'],
        });
      }
      if (!data.billingEmail) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Billing email is required when overriding district billing',
          path: ['billingEmail'],
        });
      }
      if (!data.billingAddressLine1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'Billing address is required when overriding district billing',
          path: ['billingAddressLine1'],
        });
      }
    }
  }
);

// Type for the form data
export type SchoolFormValues = z.infer<typeof schoolFormSchema>;
export type SchoolType = z.infer<typeof schoolTypeSchema>;

// Type for the API request (subset of form data)
export type CreateSchoolPayload = {
  name: string;
  enrollment?: number;
  schoolType: SchoolType;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  shippingAddressLine1?: string;
  shippingAddressLine2?: string;
  shippingAddressCity?: string;
  shippingAddressState?: string;
  shippingAddressZipCode?: string;
  schoolContactName?: string;
  schoolContactPhone?: string;
  schoolContactEmail?: string;
  notes?: string;
  overrideDistrictBilling: boolean;
  phone?: string;
  fax?: string;
  email?: string;
  website?: string;
  contactFirstName?: string;
  contactLastName?: string;
  contactTitle?: string;
  contactPhone?: string;
  contactEmail?: string;
  billingContact?: string;
  billingPhone?: string;
  billingEmail?: string;
  billingAddressLine1?: string;
  billingAddressLine2?: string;
  billingCity?: string;
  billingState?: string;
  billingZipCode?: string;
};

// Helper function to transform form data to API request format
export const transformToApiRequest = (
  formData: SchoolFormValues
): CreateSchoolPayload => {
  // Combine first and last name for schoolContactName
  const schoolContactName =
    formData.contactFirstName && formData.contactLastName
      ? `${formData.contactFirstName} ${formData.contactLastName}`.trim()
      : formData.schoolContactName || '';

  // Use contact phone/email or fallback to school phone/email
  const schoolContactPhone = formData.contactPhone || formData.phone || '';
  const schoolContactEmail = formData.contactEmail || formData.email || '';

  return {
    name: formData.name,
    enrollment: formData.enrollment,
    schoolType: formData.schoolType,
    addressLine1: formData.addressLine1,
    addressLine2: formData.addressLine2,
    city: formData.city,
    state: formData.state,
    zipCode: formData.zipCode,
    shippingAddressLine1: formData.useSchoolAddressForShipping
      ? formData.addressLine1
      : formData.shippingAddressLine1 || undefined,
    shippingAddressLine2: formData.useSchoolAddressForShipping
      ? formData.addressLine2
      : formData.shippingAddressLine2 || undefined,
    shippingAddressCity: formData.useSchoolAddressForShipping
      ? formData.city
      : formData.shippingAddressCity || undefined,
    shippingAddressState: formData.useSchoolAddressForShipping
      ? formData.state
      : formData.shippingAddressState || undefined,
    shippingAddressZipCode: formData.useSchoolAddressForShipping
      ? formData.zipCode
      : formData.shippingAddressZipCode || undefined,
    schoolContactName: schoolContactName || undefined,
    schoolContactPhone: schoolContactPhone || undefined,
    schoolContactEmail: schoolContactEmail || undefined,
    notes: formData.notes,
    overrideDistrictBilling: formData.overrideDistrictBilling,
    phone: formData.phone || undefined,
    fax: formData.fax || undefined,
    email: formData.email || undefined,
    website: formData.website || undefined,
    contactFirstName: formData.contactFirstName || undefined,
    contactLastName: formData.contactLastName || undefined,
    contactTitle: formData.contactTitle || undefined,
    contactPhone: formData.contactPhone || undefined,
    contactEmail: formData.contactEmail || undefined,
    billingContact: formData.overrideDistrictBilling ? formData.billingContact || undefined : undefined,
    billingPhone: formData.overrideDistrictBilling ? formData.billingPhone || undefined : undefined,
    billingEmail: formData.overrideDistrictBilling ? formData.billingEmail || undefined : undefined,
    billingAddressLine1: formData.overrideDistrictBilling ? formData.billingAddressLine1 || undefined : undefined,
    billingAddressLine2: formData.overrideDistrictBilling ? formData.billingAddressLine2 || undefined : undefined,
    billingCity: formData.overrideDistrictBilling ? formData.billingCity || undefined : undefined,
    billingState: formData.overrideDistrictBilling ? formData.billingState || undefined : undefined,
    billingZipCode: formData.overrideDistrictBilling ? formData.billingZipCode || undefined : undefined,
  };
};

export const UpdateSchoolRequestSchema = z
  .object({
    name: z.string().min(1, 'Name is required').optional(),
    enrollment: z.number().optional(),
    school_type: z
      .enum(
        ['High School', 'Middle School', 'Elementary School', 'Childcare'],
        {
          errorMap: () => ({
            message:
              'School type must be one of: High School, Middle School, Elementary School, Childcare',
          }),
        }
      )
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

// Type for the form data
export type UpdateSchoolFormValues = z.infer<typeof UpdateSchoolRequestSchema>;

// Helper function to transform school data to form values
export const transformSchoolToFormValues = (
  school: GetSchoolDetailsResponse
): UpdateSchoolFormValues => {
  return {
    name: school.name || undefined,
    enrollment: school.enrollment || undefined,
    school_type:
      (school.schoolType as UpdateSchoolFormValues['school_type']) || undefined,

    // Primary Address
    address_line_1: school.addressLine1 || school.addressLine1 || undefined,
    address_line_2: school.addressLine2 || school.addressLine2 || undefined,
    city: school.city || undefined,
    state: school.state || undefined,
    zip_code: school.zipCode || school.zipCode || undefined,

    // Shipping Address
    shipping_address_line_1: school.shippingAddressLine1 || undefined,
    shipping_address_line_2: school.shippingAddressLine2 || undefined,
    shipping_address_city: school.shippingAddressCity || undefined,
    shipping_address_state: school.shippingAddressState || undefined,
    shipping_address_zip_code: school.shippingAddressZipCode || undefined,

    // Contact Information
    contact_first_name:
      school.contactFirstName || school.contactFirstName || undefined,
    contact_last_name:
      school.contactLastName || school.contactLastName || undefined,
    contact_title: school.contactTitle || undefined,
    contact_phone: school.contactPhone || undefined,
    contact_email: school.contactEmail || undefined,

    // School Information
    school_contact_name:
      school.contactFirstName + ' ' + school.contactLastName || undefined,
    school_contact_phone: school.contactPhone || undefined,
    school_contact_email: school.contactEmail || undefined,
    fax: school.fax || undefined,

    // Billing Information
    override_district_billing: school.override_district_billing || false,
    billing_contact: school.billingContact || undefined,
    billing_phone: school.billingPhone || undefined,
    billing_email: school.billingEmail || undefined,
    billing_address_line_1: school.billingAddressLine1 || undefined,
    billing_address_line_2: school.billingAddressLine2 || undefined,
    billing_city: school.billingCity || undefined,
    billing_state: school.billingState || undefined,
    billing_zip_code: school.billingZipCode || undefined,

    // Additional Information
    notes: school.notes || undefined,
    shippingInstructions: school.shippingInstructions || undefined,
    shippingDeliveryHours: school.shippingDeliveryHours || undefined,
  };
};

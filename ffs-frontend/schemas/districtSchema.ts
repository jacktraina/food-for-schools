import * as z from 'zod';

export const districtFormSchema = z.object({
  // Primary Information
  name: z.string().min(1, { message: 'District name is required' }),
  location: z.string().optional(),
  directorName: z.string().min(1, { message: 'Director name is required' }),

  // Address fields (flattened to match API)
  streetAddress1: z.string().min(1, { message: 'Street address is required' }),
  streetAddress2: z.string().optional(),
  city: z.string().min(1, { message: 'City is required' }),
  state: z
    .string()
    .min(2, { message: 'State is required' })
    .regex(/^[A-Z]{2}$/, {
      message: 'Please enter a valid 2-letter state code (e.g., CA)',
    }),
  zipCode: z
    .string()
    .min(5, { message: 'ZIP code is required' })
    .regex(/^\d{5}(-\d{4})?$/, {
      message: 'Please enter a valid ZIP code (e.g., 12345 or 12345-6789)',
    }),

  // Contact Information
  phone: z.string().min(1, { message: 'Phone is required' }),
  email: z
    .string()
    .min(1, { message: 'Email is required' })
    .email({ message: 'Please enter a valid email address' }),
  fax: z.string().optional(),
  website: z.string().optional(),

  // District Details
  districtEnrollment: z.coerce
    .number()
    .int()
    .min(0, { message: 'Enrollment must be a positive number' })
    .optional(),
  raNumber: z.string().min(1, { message: 'RA Number is required' }),
  numberOfSchools: z.coerce.number().int().min(0).optional(),
  numberOfStudents: z.coerce.number().int().min(0).optional(),
  annualBudget: z.coerce.number().min(0).optional(),

  // Secondary Contact
  secondaryContactName: z.string().optional(),
  secondaryContactPhone: z.string().optional(),
  secondaryContactEmail: z
    .string()
    .optional()
    .or(z.string().email({ message: 'Please enter a valid email address' })),

  // Additional Information
  superintendentName: z.string().optional(),
  establishedYear: z.coerce
    .number()
    .int()
    .min(1800)
    .max(new Date().getFullYear())
    .optional(),

  // Billing Information (flattened to match API)
  billingContactName: z
    .string()
    .min(1, { message: 'Billing contact name is required' }),
  billingContactStreetAddress1: z
    .string()
    .min(1, { message: 'Billing street address is required' }),
  billingContactStreetAddress2: z.string().optional(),
  billingContactCity: z
    .string()
    .min(1, { message: 'Billing city is required' }),
  billingContactState: z
    .string()
    .min(2, { message: 'Billing state is required' })
    .max(2)
    .regex(/^[A-Z]{2}$/, {
      message: 'Please enter a valid 2-letter state code (e.g., CA)',
    }),
  billingContactZipCode: z
    .string()
    .min(5, { message: 'Billing ZIP code is required' })
    .regex(/^\d{5}(-\d{4})?$/, {
      message: 'Please enter a valid ZIP code (e.g., 12345 or 12345-6789)',
    }),
  billingContactPhone: z.string().optional(),
  billingContactEmail: z
    .string()
    .min(1, { message: 'Billing email is required' })
    .email({ message: 'Please enter a valid email address' }),

  // Products/Categories
  products: z.array(z.string()).optional(),

  // Delete flag
  isDelete: z.boolean().optional(),
});

export type DistrictFormValues = z.infer<typeof districtFormSchema>;

export const createDistrictSchema = z.object({
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
  website: z
    .string()
    .url({ message: 'Invalid website URL' })
    .optional()
    .or(z.literal('')),

  enrollment: z
    .number()
    .int()
    .nonnegative({ message: 'Must be a non-negative integer' })
    .optional()
    .or(z.literal('').transform(() => undefined)),
  raNumber: z.string().optional(),
  schools: z
    .number()
    .int()
    .nonnegative({ message: 'Must be a non-negative integer' })
    .optional()
    .or(z.literal('').transform(() => undefined)),
  students: z
    .number()
    .int()
    .nonnegative({ message: 'Must be a non-negative integer' })
    .optional()
    .or(z.literal('').transform(() => undefined)),
  budget: z.string().optional(),

  contact2: z.string().optional(),
  contact2Phone: z.string().optional(),
  contact2Email: z
    .string()
    .email({ message: 'Invalid email' })
    .optional()
    .or(z.literal('')),
  superintendent: z.string().optional(),
  established: z.string().optional(),

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
    .optional()
    .or(z.literal('')),

  participatingIn: z.array(z.string()).optional().default([]),
  products: z
    .array(z.string({ required_error: 'Each product must be a string' }))
    .optional(),

  status: z.string().optional().default('Active'),

  id: z.string().optional(),
  address: z.string().optional(),
  billingAddress: z.string().optional(),
});

export type CreateDistrictFormValues = z.infer<typeof createDistrictSchema>;

export const parseAddressString = (addressString = '') => {
  const defaultAddress = {
    streetAddress1: '',
    streetAddress2: '',
    city: '',
    state: '',
    zipCode: '',
  };

  if (!addressString) return defaultAddress;

  const parts = addressString.split(',').map((part) => part.trim());

  if (parts.length >= 3) {
    // Format: "123 Main St, Suite 100, City, State ZIP"
    // or: "123 Main St, City, State ZIP"
    const streetAddress1 = parts[0];
    let streetAddress2 = '';
    let cityStateZip = '';

    // Check if we have a second address line or if it's city, state zip
    if (parts.length >= 4) {
      streetAddress2 = parts[1];
      cityStateZip = parts[2];
    } else {
      cityStateZip = parts[1];
    }

    // Parse city, state, zip
    const lastPart = parts[parts.length - 1].trim();
    const stateZipMatch = lastPart.match(/([A-Z]{2})\s+(\d{5}(-\d{4})?)/);

    if (stateZipMatch) {
      const state = stateZipMatch[1];
      const zipCode = stateZipMatch[2];
      const city = parts[parts.length - 2].trim();

      return {
        streetAddress1,
        streetAddress2,
        city,
        state,
        zipCode,
      };
    }
  }

  // If we can't parse it properly, put everything in streetAddress1
  return {
    ...defaultAddress,
    streetAddress1: addressString,
  };
};

// Helper function to format address components into a string
export const formatAddressToString = (address: {
  streetAddress1: string;
  streetAddress2?: string;
  city: string;
  state: string;
  zipCode: string;
}) => {
  const { streetAddress1, streetAddress2, city, state, zipCode } = address;
  let formattedAddress = streetAddress1;

  if (streetAddress2 && streetAddress2.trim()) {
    formattedAddress += `, ${streetAddress2}`;
  }

  if (city || state || zipCode) {
    formattedAddress += `, ${city}, ${state} ${zipCode}`;
  }

  return formattedAddress;
};

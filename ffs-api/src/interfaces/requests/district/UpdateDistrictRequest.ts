import { z } from 'zod';

export const UpdateDistrictRequestDataSchema = z.object({
  name: z.string().nullish(),
  location: z.string().nullish(),
  directorName: z.string().nullish(),
  streetAddress1: z.string().nullish(),
  streetAddress2: z.string().nullish(),
  city: z.string().nullish(),
  state: z.string().nullish(),
  zipCode: z.string().nullish(),
  phone: z.string().nullish(),
  email: z.string().email().nullish(),
  fax: z.string().nullish(),
  website: z.string().nullish(),
  districtEnrollment: z.number().nullish(),
  raNumber: z.string().nullish(),
  numberOfSchools: z.number().nullish(),
  numberOfStudents: z.number().nullish(),
  annualBudget: z.number().nullish(),
  secondaryContactName: z.string().nullish(),
  secondaryContactPhone: z.string().nullish(),
  secondaryContactEmail: z.string().email().nullish(),
  superintendentName: z.string().nullish(),
  establishedYear: z.number().nullish(),
  billingContactName: z.string().nullish(),
  billingContactStreetAddress1: z.string().nullish(),
  billingContactStreetAddress2: z.string().nullish(),
  billingContactCity: z.string().nullish(),
  billingContactState: z.string().nullish(),
  billingContactZipCode: z.string().nullish(),
  billingContactPhone: z.string().nullish(),
  billingContactEmail: z.string().email().nullish(),
  products: z.array(z.string()).nullish(),
  isDelete: z.boolean().nullish(),
});

export const UpdateDistrictRequestSchema = z.object({
  params: z.object({
    districtId: z
      .string()
      .regex(/^\d+$/, { message: 'District ID must be a valid number' }),
  }),
  body: UpdateDistrictRequestDataSchema,
});

export type UpdateDistrictRequest = z.infer<typeof UpdateDistrictRequestSchema>;
export type UpdateDistrictRequestData = z.infer<typeof UpdateDistrictRequestDataSchema>;
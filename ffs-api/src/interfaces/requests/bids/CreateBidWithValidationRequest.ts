import { z } from 'zod';

export const CreateBidWithValidationRequestSchema = z.object({
  name: z.string(),
  note: z.string().optional(),
  bidYear: z.string(),
  categoryId: z.number().int().positive(),
  status: z.enum(['In Process', 'Released', 'Opened', 'Awarded', 'Canceled', 'Archived']),
  awardType: z.string(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  anticipatedOpeningDate: z.string().datetime().optional(),
  awardDate: z.string().datetime().optional(),
  bidManagerId: z.number().int().positive(),
  description: z.string().optional(),
  estimatedValue: z.string().optional(),
  cooperativeId: z.number().int().positive().optional(),
  districtId: z.number().int().positive().optional(),
});

export type CreateBidWithValidationRequest = z.infer<typeof CreateBidWithValidationRequestSchema>;

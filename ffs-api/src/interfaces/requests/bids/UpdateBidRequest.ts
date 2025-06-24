import { z } from 'zod';

export const UpdateBidRequestSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  note: z.string().optional(),
  bidYear: z.string().min(1, 'Bid year is required').optional(),
  categoryId: z.number().optional(),
  status: z.enum(['In Process', 'Released', 'Opened', 'Awarded', 'Canceled', 'Archived']).optional(),
  awardType: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  anticipatedOpeningDate: z.string().datetime().optional(),
  awardDate: z.string().datetime().optional(),
  userId: z.number().optional(),
  description: z.string().optional(),
  estimatedValue: z.string().optional(),
  cooperativeId: z.number().optional(),
  districtId: z.number().optional(),

});

export type UpdateBidRequest = z.infer<typeof UpdateBidRequestSchema>;

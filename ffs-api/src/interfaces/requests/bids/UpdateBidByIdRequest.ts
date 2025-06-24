import { z } from 'zod';

export const UpdateBidByIdRequestSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number')
  }),
  body: z.object({
    name: z.string().min(1, 'Name is required').optional(),
    note: z.string().optional(),
    bidYear: z.string().min(1, 'Bid year is required').optional(),
    categoryId: z.number().int().positive().optional(),
    status: z.string().optional(),
    awardType: z.string().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    anticipatedOpeningDate: z.string().datetime().optional(),
    awardDate: z.string().datetime().optional(),
    userId: z.number().int().positive().optional(),
    description: z.string().optional(),
    estimatedValue: z.string().optional(),
    cooperativeId: z.number().int().positive().optional(),
    districtId: z.number().int().positive().optional()
  })
});

export type UpdateBidByIdRequest = z.infer<typeof UpdateBidByIdRequestSchema>;

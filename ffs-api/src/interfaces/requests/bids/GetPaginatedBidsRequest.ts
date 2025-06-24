import { z } from 'zod';

export const GetPaginatedBidsRequestSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    page: z.string().regex(/^\d+$/, 'Page must be a number').optional().default('1'),
    limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional().default('10'),
    search: z.string().optional(),
    bidYear: z.string().optional(),
    status: z.string().optional(),
    awardType: z.string().optional(),
    myBids: z.string().optional(),
    districtId: z.string().regex(/^\d+$/, 'District ID must be a number').optional(),
    cooperativeId: z.string().regex(/^\d+$/, 'Cooperative ID must be a number').optional()
  })
});

export type GetPaginatedBidsRequest = z.infer<typeof GetPaginatedBidsRequestSchema>;

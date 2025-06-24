import { z } from 'zod';

export const UpdateBidItemByIdRequestSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number')
  }),
  body: z.object({
    itemName: z.string().min(1, 'Item name is required').optional(),
    awardGroup: z.string().optional(),
    projectionUnit: z.string().min(1, 'Projection unit is required').optional(),
    bidUnit: z.string().min(1, 'Bid unit is required').optional(),
    bidUnitProjUnit: z.number().min(0, 'Bid unit projection unit must be a positive number').optional(),
    minProjection: z.number().min(0).optional(),
    status: z.string().optional(),
    diversion: z.string().optional(),
    acceptableBrands: z.string().optional(),
    projection: z.number().optional(),
    totalBidUnits: z.number().optional(),
    percentDistrictsUsing: z.number().optional(),
  })
});

export type UpdateBidItemByIdRequest = z.infer<typeof UpdateBidItemByIdRequestSchema>;

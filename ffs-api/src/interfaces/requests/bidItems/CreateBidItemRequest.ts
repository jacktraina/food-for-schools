import { z } from 'zod';

export const CreateBidItemRequestSchema = z.object({
  bidId: z.number().min(1, 'Bid ID is required'),
  itemName: z.string().min(1, 'Item name is required'),
  awardGroup: z.string().optional(),
  projectionUnit: z.string().min(1, 'Projection unit is required'),
  bidUnit: z.string().min(1, 'Bid unit is required'),
  bidUnitProjUnit: z.number().min(0, 'Bid unit projection unit must be a positive number'),
  minProjection: z.number().min(0).optional(),
  status: z.string().optional(),
  diversion: z.string().optional(),
  acceptableBrands: z.string().optional(),
  bidSpecification: z.string().optional(),
  projection: z.number().optional(),
  totalBidUnits: z.number().optional(),
  percentDistrictsUsing: z.number().optional(),
});

export type CreateBidItemRequest = z.infer<typeof CreateBidItemRequestSchema>;

import * as z from 'zod';

export const CreateBidItemSchema = z.object({
  bidId: z.coerce.number().min(1, 'Bid ID is required'),
  itemName: z.string().min(1, 'Item name is required'),
  awardGroup: z.string().optional(),
  projectionUnit: z.string().min(1, 'Projection unit is required'),
  bidUnit: z.string().min(1, 'Bid unit is required'),
  bidUnitProjUnit: z.coerce
    .number()
    .min(0, 'Bid unit projection unit must be a positive number'),
  minProjection: z.coerce.number().min(0).optional(),
  status: z.string().optional(),
  diversion: z.string().optional(),
  acceptableBrands: z.string().optional(),
  bidSpecification: z.string().optional(),
  projection: z.coerce.number().optional(),
  totalBidUnits: z.coerce.number().optional(),
  percentDistrictsUsing: z.coerce.number().optional(),
});

export type CreateBidItem = z.infer<typeof CreateBidItemSchema>;

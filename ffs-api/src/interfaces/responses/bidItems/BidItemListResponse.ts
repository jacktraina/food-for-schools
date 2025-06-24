export interface BidItemResponse {
  id: number;
  itemName: string;
  acceptableBrands: string;
  bidId?: number;
  bidName?: string;
  awardGroup?: string;
  status?: string;
  projection?: number;
  projectionUnit?: string;
  diversion?: string;
  minProjection?: number;
  totalBidUnits?: number;
  bidUnit?: string;
  bidUnitProjUnit?: number;
  percentDistrictsUsing?: number;
}

export interface BidItemListResponse {
  items: BidItemResponse[];
}

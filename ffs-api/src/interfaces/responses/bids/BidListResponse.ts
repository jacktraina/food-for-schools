export interface BidListItem {
  id: string;
  name: string;
  bidYear: string;
  status: string;
  awardType: string;
  startDate: Date | null;
  endDate: Date | null;
  anticipatedOpeningDate: Date | null;
  bidManagerId: string;
  bidManagerName?: string;
  organizationId: string;
  organizationType: string;
  note: string;
  category: string;
  description: string;
  estimatedValue: string;
  awardDate: Date | null;
  external_id: string;
}

export interface BidListResponse {
  bids: BidListItem[];
}

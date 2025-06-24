export interface BidApprovals {
  termsAndConditions: string;
  requiredForms: string;
  bidItems: string;
  participatingDistricts: string;
}

export interface BidDetailsResponse {
  id: number;
  code?: string | null;
  name: string | null;
  note?: string | null;
  bidYear?: string | null;
  categoryId?: number | null;
  status: string | null;
  awardType?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  anticipatedOpeningDate?: Date | null;
  awardDate?: Date | null;
  releaseDate?: Date | null;
  userId?: number | null;
  bidManagerId?: string | null;
  description?: string | null;
  estimatedValue?: string | null;
  cooperativeId?: number | null;
  districtId?: number | null;
  schoolId?: number | null;
  isDeleted?: boolean | null;
  createdAt?: Date;
  updatedAt?: Date;
  approvals: BidApprovals;
}

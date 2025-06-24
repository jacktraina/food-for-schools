export interface BidApprovals {
  termsAndConditions: string;
  requiredForms: string;
  bidItems: string;
  participatingDistricts: string;
}

export interface UpdateBidRequest {
  name?: string;
  note?: string;
  bidYear?: string;
  categoryId?: number;
  status?: string;
  awardType?: string;
  startDate?: Date;
  endDate?: Date;
  anticipatedOpeningDate?: Date;
  awardDate?: Date;
  userId?: number;
  description?: string;
  estimatedValue?: string;
  cooperativeId?: number;
  districtId?: number;
}

export interface BidDetailsResponse {
  id: number;
  code?: string;
  name: string;
  note?: string;
  bidYear?: string;
  categoryId?: number;
  status: string;
  awardType?: string;
  startDate?: Date;
  endDate?: Date;
  anticipatedOpeningDate?: Date;
  awardDate?: Date;
  releaseDate?: Date;
  userId?: number;
  bidManagerId?: string;
  description?: string;
  estimatedValue?: string;
  cooperativeId?: number;
  districtId?: number;
  schoolId?: number;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  approvals: BidApprovals;
}

export interface BidCategory {
  id: number;
  code: string;
  name: string;
  description?: string;
}

export interface BidResponse {
  id: string;
  name: string;
  bidYear: string;
  status: string;
  awardType: string;
  startDate?: Date;
  endDate?: Date;
  anticipatedOpeningDate?: Date;
  bidManagerId: string;
  bidManagerName?: string;
  organizationId: string;
  organizationType: string;
  note: string;
  category: string;
  description: string;
  estimatedValue: string;
  awardDate?: Date;
  external_id: string;
}

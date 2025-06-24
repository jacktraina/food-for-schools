import { Bid } from '../../domain/interfaces/Bids/Bid';
import { BidDetailsResponse } from '../../interfaces/responses/bids/BidDetailsResponse';

export interface IBidService {
  createBid(bidData: {
    name: string;
    note?: string;
    bidYear: string;
    categoryId?: number;
    status: string;
    awardType?: string;
    startDate?: Date;
    endDate?: Date;
    anticipatedOpeningDate?: Date;
    awardDate?: Date;
    userId?: number;
    description?: string;
    estimatedValue?: string;
    organizationId?: number;

  }): Promise<Bid>;
  
  getBidById(id: number): Promise<Bid>;
  getBidDetailsById(id: number): Promise<BidDetailsResponse>;
  getAllBids(): Promise<Bid[]>;
  getBidsForUser(user: { cooperativeId?: number | null; districtId?: number | null }): Promise<Bid[]>;
  getBidsForBidManager(bidManagerId: number): Promise<Bid[]>;
  getBidsByDistrictId(districtId: number): Promise<Bid[]>;
  getBidsByCooperativeId(cooperativeId: number): Promise<Bid[]>;
  getPaginatedBids(params: {
    page: number;
    limit: number;
    search?: string;
    bidYear?: string;
    status?: string;
    awardType?: string;
    userId?: number;
    districtId?: number;
    cooperativeId?: number;
  }): Promise<{ bids: Bid[]; total: number }>;
  updateBid(id: number, bidData: {
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
  }): Promise<Bid | null>;
  deleteBid(id: number): Promise<void>;
}

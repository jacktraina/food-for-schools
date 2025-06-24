import { Bid } from './Bid';

export interface IBidRepository {
  countActive(): Promise<number>;
  countActiveSince(date: Date): Promise<number>;
  countActiveByOrganization(params: { cooperativeId?: number; districtId?: number }): Promise<number>;
  countActiveSinceByOrganization(date: Date, params: { cooperativeId?: number; districtId?: number }): Promise<number>;
  create(bid: Bid): Promise<Bid>;
  findById(id: number): Promise<Bid | null>;
  findAll(): Promise<Bid[]>;
  findByScope(params: { 
    cooperativeId?: number; 
    districtId?: number; 
    schoolId?: number 
  }): Promise<Bid[]>;
  findByBidManager(bidManagerId: number): Promise<Bid[]>;
  findByDistrictId(districtId: number): Promise<Bid[]>;
  findByCooperativeId(cooperativeId: number): Promise<Bid[]>;
  findPaginated(params: {
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
  update(bid: Bid): Promise<Bid | null>;
  delete(id: number): Promise<boolean>;
  softDelete(id: number): Promise<void>;
}

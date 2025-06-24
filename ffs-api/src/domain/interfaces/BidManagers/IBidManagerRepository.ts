import { BidManager } from './BidManager';

export interface IBidManagerRepository {
  create(bidManager: BidManager): Promise<BidManager>;
  findById(id: number): Promise<BidManager | null>;
  findByUserId(userId: number): Promise<BidManager[]>;
  findByBidId(bidId: number): Promise<BidManager[]>;
  findAll(): Promise<BidManager[]>;
  update(bidManager: BidManager): Promise<BidManager>;
  delete(id: number): Promise<boolean>;
}

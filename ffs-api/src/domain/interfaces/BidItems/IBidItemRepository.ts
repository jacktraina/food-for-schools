import { BidItem } from './BidItem';

export interface IBidItemRepository {
  findAll(): Promise<BidItem[]>;
  findByBidId(bidId: number): Promise<BidItem[]>;
  findById(id: number): Promise<BidItem | null>;
  create(bidItem: BidItem): Promise<BidItem>;
  update(bidItem: BidItem): Promise<BidItem>;
  delete(id: number): Promise<boolean>;
}

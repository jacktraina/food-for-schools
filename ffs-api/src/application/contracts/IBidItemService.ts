import { BidItem } from '../../domain/interfaces/BidItems/BidItem';

export interface IBidItemService {
  getAllBidItems(): Promise<BidItem[]>;
  getBidItemsByBidId(bidId: number): Promise<BidItem[]>;
  getBidItemById(id: number): Promise<BidItem>;
  createBidItem(bidItemData: {
    id?: number;
    bidId: number;
    itemName: string;
    acceptableBrands?: string;
    awardGroup?: string;
    status?: string;
  }): Promise<BidItem>;
  updateBidItem(id: number, bidItemData: {
    itemName?: string;
    acceptableBrands?: string;
    awardGroup?: string;
    status?: string;
  }): Promise<BidItem>;
  deleteBidItem(id: number): Promise<void>;
}

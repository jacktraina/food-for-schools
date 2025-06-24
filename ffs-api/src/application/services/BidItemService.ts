import { inject, injectable } from 'inversify';
import { IBidItemService } from '../contracts/IBidItemService';
import { IBidItemRepository } from '../../domain/interfaces/BidItems/IBidItemRepository';
import { BidItem } from '../../domain/interfaces/BidItems/BidItem';
import { NotFoundError } from '../../domain/core/errors/NotFoundError';
import TYPES from '../../shared/dependencyInjection/types';

@injectable()
export class BidItemService implements IBidItemService {
  constructor(
    @inject(TYPES.IBidItemRepository) private bidItemRepository: IBidItemRepository
  ) {}

  async getAllBidItems(): Promise<BidItem[]> {
    return await this.bidItemRepository.findAll();
  }

  async getBidItemsByBidId(bidId: number): Promise<BidItem[]> {
    return await this.bidItemRepository.findByBidId(bidId);
  }

  async getBidItemById(id: number): Promise<BidItem> {
    const bidItem = await this.bidItemRepository.findById(id);
    if (!bidItem) {
      throw new NotFoundError('BidItem');
    }
    return bidItem;
  }

  async createBidItem(bidItemData: {
    id?: number;
    bidId: number;
    itemName: string;
    acceptableBrands?: string;
    awardGroup?: string;
    status?: string;
    projectionUnit?: string;
    bidUnit?: string;
    bidUnitProjUnit?: number;
    minProjection?: number;
    diversion?: string;
    projection?: number;
    totalBidUnits?: number;
    percentDistrictsUsing?: number;
  }): Promise<BidItem> {
    BidItem.validateItemName(bidItemData.itemName);
    BidItem.validateBidId(bidItemData.bidId);

    const bidItem = new BidItem({
      id: bidItemData.id,
      bidId: bidItemData.bidId,
      itemName: bidItemData.itemName,
      acceptableBrands: bidItemData.acceptableBrands,
      awardGroup: bidItemData.awardGroup,
      status: bidItemData.status || 'Active',
      projectionUnit: bidItemData.projectionUnit,
      bidUnit: bidItemData.bidUnit,
      bidUnitProjUnit: bidItemData.bidUnitProjUnit,
      minProjection: bidItemData.minProjection,
      diversion: bidItemData.diversion,
      projection: bidItemData.projection,
      totalBidUnits: bidItemData.totalBidUnits,
      percentDistrictsUsing: bidItemData.percentDistrictsUsing,
    });

    return await this.bidItemRepository.create(bidItem);
  }

  async updateBidItem(id: number, bidItemData: {
    itemName?: string;
    acceptableBrands?: string;
    awardGroup?: string;
    status?: string;
    projectionUnit?: string;
    bidUnit?: string;
    bidUnitProjUnit?: number;
    minProjection?: number;
    diversion?: string;
    projection?: number;
    totalBidUnits?: number;
    percentDistrictsUsing?: number;
  }): Promise<BidItem> {
    const existingBidItem = await this.getBidItemById(id);

    const updatedBidItem = existingBidItem.update(bidItemData);

    const result = await this.bidItemRepository.update(updatedBidItem);
    if (!result) {
      throw new Error('Failed to update bid item');
    }
    return result;
  }

  async deleteBidItem(id: number): Promise<void> {
    await this.getBidItemById(id);
    await this.bidItemRepository.delete(id);
  }
}

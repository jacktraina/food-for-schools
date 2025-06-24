import { BidCategory } from './BidCategory';

export interface IBidCategoryRepository {
  create(bidCategory: BidCategory): Promise<BidCategory>;
  findById(id: number): Promise<BidCategory | null>;
  findAll(): Promise<BidCategory[]>;
  update(bidCategory: BidCategory): Promise<BidCategory>;
  delete(id: number): Promise<boolean>;
}

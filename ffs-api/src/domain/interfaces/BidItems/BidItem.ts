import { Bid } from '../Bids/Bid';

export interface IBidItemProps {
  id?: number;
  bidId: number;
  itemName: string;
  acceptableBrands?: string | null;
  awardGroup?: string | null;
  diversion?: string | null;
  status?: string | null;
  projection?: number | null;
  projectionUnit?: string | null;
  minProjection?: number | null;
  totalBidUnits?: number | null;
  bidUnit?: string | null;
  bidUnitProjUnit?: number | null;
  percentDistrictsUsing?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
  isDeleted?: boolean;
  bid?: Bid;
}

export class BidItem {
  id: number;
  bidId: number;
  itemName: string;
  acceptableBrands?: string | null;
  awardGroup?: string | null;
  diversion?: string | null;
  status?: string | null;
  projection?: number | null;
  projectionUnit?: string | null;
  minProjection?: number | null;
  totalBidUnits?: number | null;
  bidUnit?: string | null;
  bidUnitProjUnit?: number | null;
  percentDistrictsUsing?: number | null;
  createdAt: Date;
  updatedAt?: Date;
  isDeleted: boolean;
  bid?: Bid;

  constructor(props: IBidItemProps) {
    this.id = props.id || 0;
    this.bidId = props.bidId;
    this.itemName = props.itemName;
    this.acceptableBrands = props.acceptableBrands;
    this.awardGroup = props.awardGroup;
    this.diversion = props.diversion;
    this.status = props.status;
    this.projection = props.projection;
    this.projectionUnit = props.projectionUnit;
    this.minProjection = props.minProjection;
    this.totalBidUnits = props.totalBidUnits;
    this.bidUnit = props.bidUnit;
    this.bidUnitProjUnit = props.bidUnitProjUnit;
    this.percentDistrictsUsing = props.percentDistrictsUsing;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt;
    this.isDeleted = props.isDeleted ?? false;
    this.bid = props.bid;

    BidItem.validateItemName(this.itemName);
    BidItem.validateBidId(this.bidId);
  }

  static validateItemName(itemName: string): void {
    if (!itemName || itemName.trim() === '') {
      throw new Error('itemName is required');
    }
  }

  static validateBidId(bidId: number): void {
    if (!bidId || bidId <= 0) {
      throw new Error('bidId is required and must be a positive number');
    }
  }

  updateAwardGroup(awardGroup: string): void {
    this.awardGroup = awardGroup;
    this.updatedAt = new Date();
  }

  markAsActive(): void {
    this.status = 'Active';
    this.updatedAt = new Date();
  }

  markAsInactive(): void {
    this.status = 'Inactive';
    this.updatedAt = new Date();
  }

  toJSON(): IBidItemProps {
    return {
      id: this.id,
      bidId: this.bidId,
      itemName: this.itemName,
      acceptableBrands: this.acceptableBrands ?? undefined,
      awardGroup: this.awardGroup ?? undefined,
      diversion: this.diversion ?? undefined,
      status: this.status ?? undefined,
      projection: this.projection ?? undefined,
      projectionUnit: this.projectionUnit ?? undefined,
      minProjection: this.minProjection ?? undefined,
      totalBidUnits: this.totalBidUnits ?? undefined,
      bidUnit: this.bidUnit ?? undefined,
      bidUnitProjUnit: this.bidUnitProjUnit ?? undefined,
      percentDistrictsUsing: this.percentDistrictsUsing ?? undefined,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      isDeleted: this.isDeleted,
      bid: this.bid,
    };
  }

  update(props: Partial<IBidItemProps>): BidItem {
    if (props.itemName !== undefined) {
      BidItem.validateItemName(props.itemName);
    }
    
    if (props.bidId !== undefined) {
      BidItem.validateBidId(props.bidId);
    }

    return new BidItem({
      ...this.toJSON(),
      ...props,
      updatedAt: new Date(),
    });
  }
}

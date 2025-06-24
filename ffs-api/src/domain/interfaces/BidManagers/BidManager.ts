export interface IBidManagerProps {
  id?: number;
  userId: number;
  bidId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class BidManager {
  id?: number;
  userId: number;
  bidId: number;
  createdAt: Date;
  updatedAt?: Date;

  constructor(props: IBidManagerProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.bidId = props.bidId;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt;

    BidManager.validateUserId(this.userId);
    BidManager.validateBidId(this.bidId);
  }

  static validateUserId(userId: number): void {
    if (!Number.isInteger(userId) || userId <= 0) {
      throw new Error('userId must be a positive integer');
    }
  }

  static validateBidId(bidId: number): void {
    if (!Number.isInteger(bidId) || bidId <= 0) {
      throw new Error('bidId must be a positive integer');
    }
  }
}

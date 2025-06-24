import { BidManager } from '../../domain/interfaces/BidManagers/BidManager';

export class BidManagerMapper {
  static toPrisma(entity: BidManager) {
    return {
      id: entity.id,
      userId: entity.userId,
      bidId: entity.bidId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static toDomain(prismaModel: {
    id: number;
    userId: number;
    bidId: number;
    createdAt: Date;
    updatedAt: Date;
  }): BidManager {
    return new BidManager({
      id: prismaModel.id,
      userId: prismaModel.userId,
      bidId: prismaModel.bidId,
      createdAt: prismaModel.createdAt,
      updatedAt: prismaModel.updatedAt,
    });
  }
}

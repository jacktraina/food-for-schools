import { injectable } from 'inversify';
import { PrismaClient } from '@prisma/client';
import { BidManager } from '../../domain/interfaces/BidManagers/BidManager';
import { IBidManagerRepository } from '../../domain/interfaces/BidManagers/IBidManagerRepository';

@injectable()
export class BidManagerRepository implements IBidManagerRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(bidManager: BidManager): Promise<BidManager> {
    const createdBidManager = await this.prisma.bidManagers.create({
      data: {
        userId: bidManager.userId,
        bidId: bidManager.bidId,
        createdAt: new Date(),
      },
    });

    return new BidManager({
      id: createdBidManager.id,
      userId: createdBidManager.userId,
      bidId: createdBidManager.bidId,
      createdAt: createdBidManager.createdAt,
    });
  }

  async findById(id: number): Promise<BidManager | null> {
    const bidManager = await this.prisma.bidManagers.findUnique({
      where: { id },
    });

    if (!bidManager) {
      return null;
    }

    return new BidManager({
      id: bidManager.id,
      userId: bidManager.userId,
      bidId: bidManager.bidId,
      createdAt: bidManager.createdAt,

    });
  }

  async findByUserId(userId: number): Promise<BidManager[]> {
    const bidManagers = await this.prisma.bidManagers.findMany({
      where: { userId },
    });

    return bidManagers.map(bidManager => new BidManager({
      id: bidManager.id,
      userId: bidManager.userId,
      bidId: bidManager.bidId,
      createdAt: bidManager.createdAt,

    }));
  }

  async findByBidId(bidId: number): Promise<BidManager[]> {
    const bidManagers = await this.prisma.bidManagers.findMany({
      where: { bidId },
    });

    return bidManagers.map(bidManager => new BidManager({
      id: bidManager.id,
      userId: bidManager.userId,
      bidId: bidManager.bidId,
      createdAt: bidManager.createdAt,

    }));
  }

  async findAll(): Promise<BidManager[]> {
    const bidManagers = await this.prisma.bidManagers.findMany();

    return bidManagers.map(bidManager => new BidManager({
      id: bidManager.id,
      userId: bidManager.userId,
      bidId: bidManager.bidId,
      createdAt: bidManager.createdAt,

    }));
  }

  async update(bidManager: BidManager): Promise<BidManager> {
    const updatedBidManager = await this.prisma.bidManagers.update({
      where: { id: bidManager.id },
      data: {
        userId: bidManager.userId,
        bidId: bidManager.bidId,
      },
    });

    return new BidManager({
      id: updatedBidManager.id,
      userId: updatedBidManager.userId,
      bidId: updatedBidManager.bidId,
      createdAt: updatedBidManager.createdAt,
    });
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.bidManagers.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }
}

import { injectable } from 'inversify';
import { PrismaClient } from '@prisma/client';
import { BidCategory } from '../../domain/interfaces/BidCategories/BidCategory';
import { IBidCategoryRepository } from '../../domain/interfaces/BidCategories/IBidCategoryRepository';

@injectable()
export class BidCategoryRepository implements IBidCategoryRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(bidCategory: BidCategory): Promise<BidCategory> {
    const createdBidCategory = await this.prisma.bidCategories.create({
      data: {
        code: bidCategory.code,
        name: bidCategory.name,
        description: bidCategory.description,
      },
    });

    return new BidCategory({
      id: createdBidCategory.id,
      code: createdBidCategory.code,
      name: createdBidCategory.name,
      description: createdBidCategory.description ?? undefined,
      createdAt: createdBidCategory.createdAt,
      updatedAt: createdBidCategory.updatedAt,
    });
  }

  async findById(id: number): Promise<BidCategory | null> {
    const bidCategory = await this.prisma.bidCategories.findUnique({
      where: { id },
    });

    if (!bidCategory) {
      return null;
    }

    return new BidCategory({
      id: bidCategory.id,
      code: bidCategory.code,
      name: bidCategory.name,
      description: bidCategory.description ?? undefined,
      createdAt: bidCategory.createdAt,
      updatedAt: bidCategory.updatedAt,
    });
  }

  async findAll(): Promise<BidCategory[]> {
    const bidCategories = await this.prisma.bidCategories.findMany();

    return bidCategories.map(bidCategory => new BidCategory({
      id: bidCategory.id,
      code: bidCategory.code,
      name: bidCategory.name,
      description: bidCategory.description ?? undefined,
      createdAt: bidCategory.createdAt,
      updatedAt: bidCategory.updatedAt,
    }));
  }

  async update(bidCategory: BidCategory): Promise<BidCategory> {
    const updatedBidCategory = await this.prisma.bidCategories.update({
      where: { id: bidCategory.id },
      data: {
        code: bidCategory.code,
        name: bidCategory.name,
        description: bidCategory.description,
      },
    });

    return new BidCategory({
      id: updatedBidCategory.id,
      code: updatedBidCategory.code,
      name: updatedBidCategory.name,
      description: updatedBidCategory.description ?? undefined,
      createdAt: updatedBidCategory.createdAt,
      updatedAt: updatedBidCategory.updatedAt,
    });
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.bidCategories.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }
}

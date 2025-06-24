import { inject, injectable } from 'inversify';
import { IDatabaseService } from '../../application/contracts/IDatabaseService';
import TYPES from '../../shared/dependencyInjection/types';
import { PrismaClient } from '@prisma/client';
import { IDistrictProductRepository } from '../../domain/interfaces/DistrictProducts/IDistrictProductRepository';
import { DistrictProduct } from '../../domain/interfaces/DistrictProducts/DistrictProduct';
import { District } from '../../domain/interfaces/Districts/District';

@injectable()
export class DistrictProductRepository implements IDistrictProductRepository {
  private districtProductModel: PrismaClient['districtProduct'];

  constructor(@inject(TYPES.IDatabaseService) database: IDatabaseService) {
    this.districtProductModel = database.getClient().districtProduct;
  }

  async create(districtProduct: { districtId: number; productName: string }): Promise<DistrictProduct> {
    try {
      const createdDistrictProduct = await this.districtProductModel.create({
        data: {
          districtId: districtProduct.districtId,
          productName: districtProduct.productName,
        },
        select: {
          id: true,
          districtId: true,
          productName: true,
          createdAt: true,
          district: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return new DistrictProduct({
        id: createdDistrictProduct.id,
        districtId: createdDistrictProduct.districtId,
        productName: createdDistrictProduct.productName,
        createdAt: createdDistrictProduct.createdAt ?? undefined,
        district: createdDistrictProduct.district
          ? {
              id: createdDistrictProduct.district.id,
              name: createdDistrictProduct.district.name,
            } as District
          : undefined,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('Unique constraint')) {
        throw new Error('A product with this name already exists for the specified district');
      }
      throw error;
    }
  }

  async deleteByDistrictId(districtId: number): Promise<void> {
    await this.districtProductModel.deleteMany({
      where: { districtId },
    });
  }

  async findByDistrictId(districtId: number): Promise<DistrictProduct[]> {
    const districtProducts = await this.districtProductModel.findMany({
      where: { districtId },
      select: {
        id: true,
        districtId: true,
        productName: true,
        createdAt: true,
        district: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return districtProducts.map(
      (product) =>
        new DistrictProduct({
          id: product.id,
          districtId: product.districtId,
          productName: product.productName,
          createdAt: product.createdAt ?? undefined,
          district: product.district
            ? {
                id: product.district.id,
                name: product.district.name,
              } as District
            : undefined,
        })
    );
  }

  async findById(id: number): Promise<DistrictProduct | null> {
    const product = await this.districtProductModel.findUnique({
      where: { id },
      select: {
        id: true,
        districtId: true,
        productName: true,
        createdAt: true,
        district: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!product) return null;

    return new DistrictProduct({
      id: product.id,
      districtId: product.districtId,
      productName: product.productName,
      createdAt: product.createdAt ?? undefined,
      district: product.district
        ? {
            id: product.district.id,
            name: product.district.name,
          } as District
        : undefined,
    });
  }

  async createWithTransaction(prisma: PrismaClient, districtProduct: { districtId: number; productName: string }): Promise<DistrictProduct> {
    try {
      const createdDistrictProduct = await prisma.districtProduct.create({
        data: {
          districtId: districtProduct.districtId,
          productName: districtProduct.productName,
        },
        select: {
          id: true,
          districtId: true,
          productName: true,
          createdAt: true,
          district: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return new DistrictProduct({
        id: createdDistrictProduct.id,
        districtId: createdDistrictProduct.districtId,
        productName: createdDistrictProduct.productName,
        createdAt: createdDistrictProduct.createdAt ?? undefined,
        district: createdDistrictProduct.district
          ? {
              id: createdDistrictProduct.district.id,
              name: createdDistrictProduct.district.name,
            } as District
          : undefined,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('Unique constraint')) {
        throw new Error('A product with this name already exists for the specified district');
      }
      throw error;
    }
  }

  async deleteByDistrictIdWithTransaction(prisma: PrismaClient, districtId: number): Promise<void> {
    await prisma.districtProduct.deleteMany({
      where: { districtId },
    });
  }
}

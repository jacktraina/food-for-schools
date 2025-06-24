import { DistrictProduct } from './DistrictProduct';
import { PrismaClient } from '@prisma/client';

export interface IDistrictProductRepository {
  create(districtProduct: {
    districtId: number;
    productName: string;
  }): Promise<DistrictProduct>;
  createWithTransaction(prisma: PrismaClient, districtProduct: {
    districtId: number;
    productName: string;
  }): Promise<DistrictProduct>;
  deleteByDistrictId(districtId: number): Promise<void>;
  deleteByDistrictIdWithTransaction(prisma: PrismaClient, districtId: number): Promise<void>;
  findByDistrictId(districtId: number): Promise<DistrictProduct[]>;
}

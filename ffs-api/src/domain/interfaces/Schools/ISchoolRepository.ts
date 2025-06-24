import { School } from './School';
import { PrismaClient } from '@prisma/client';

export interface ISchoolRepository {
  create(school: School): Promise<School>;
  createWithTransaction(prisma: PrismaClient, school: School): Promise<School>;
  findById(id: number): Promise<School | null>;
  findByDistrictId(districtId: number): Promise<School[]>;
  findByDistrictIdWithStatus(districtId: number): Promise<School[]>;
  update(school: School): Promise<School | null>;
  updateWithTransaction(prisma: PrismaClient, school: School): Promise<School | null>;
  softDelete(id: number): Promise<void>;
}

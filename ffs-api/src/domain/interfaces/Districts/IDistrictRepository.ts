import { District } from './District';
import { PrismaClient } from '@prisma/client';

export interface IDistrictRepository {
  create(district: District): Promise<District>;
  createWithTransaction(prisma: PrismaClient, district: District): Promise<District>;
  findAll(): Promise<District[]>;
  findByCooperativeId(cooperativeId: number): Promise<District[]>;
  findByIds(districtId: number): Promise<District | null>;
  update(district: District): Promise<void>;
  updateWithTransaction(prisma: PrismaClient, district: District): Promise<void>;
  findLastDistrictCode(): Promise<string | null>;
  countByCooperativeId(cooperativeId: number): Promise<number>;
  countByCooperativeIdSince(cooperativeId: number, date: Date): Promise<number>;
}

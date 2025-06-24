import { District } from "../Districts/District";

export interface IDistrictProductProps {
  id?: number;
  districtId: number;
  productName: string;
  createdAt?: Date;
  district?: District; // Changed from districts to district to match Prisma relation
}

export class DistrictProduct {
  id?: number;
  districtId: number;
  productName: string;
  createdAt: Date;
  district?: District;

  constructor({
    id,
    districtId,
    productName,
    createdAt,
    district,
  }: IDistrictProductProps) {
    this.id = id;
    this.districtId = districtId;
    this.productName = productName;
    this.createdAt = createdAt ?? new Date(); // Set default to now, aligning with Prisma's default(now())
    this.district = district;

    // Validate required fields
    DistrictProduct.validateDistrictId(this.districtId);
    DistrictProduct.validateProductName(this.productName);
  }

  static validateDistrictId(districtId: number): void {
    if (!Number.isInteger(districtId) || districtId <= 0) {
      throw new Error('districtId must be a positive integer');
    }
  }

  static validateProductName(productName: string): void {
    if (!productName || productName.trim() === '') {
      throw new Error('productName is required and cannot be empty');
    }
  }

  getDisplayName(): string {
    return this.productName;
  }
}
import { inject, injectable } from 'inversify';
import { IVendorService } from '../contracts/IVendorService';
import { IVendorRepository } from '../../domain/interfaces/vendors/IVendorRepository';
import { IDatabaseService } from '../contracts/IDatabaseService';
import TYPES from '../../shared/dependencyInjection/types';
import { Vendor } from '../../domain/interfaces/vendors/Vendor';
import { BadRequestError } from '../../domain/core/errors/BadRequestError';
import { PrismaClient } from '@prisma/client';
import { StatusEnum } from '../../domain/constants/StatusEnum';

@injectable()
export class VendorService implements IVendorService {
  private prisma: PrismaClient;

  constructor(
    @inject(TYPES.IVendorRepository) private vendorRepository: IVendorRepository,
    @inject(TYPES.IDatabaseService) private databaseService: IDatabaseService
  ) {
    this.prisma = this.databaseService.getClient();
  }

  async registerVendor(
    companyName: string,
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    organizationId: number,
    organizationType: 'cooperative' | 'district'
  ): Promise<{ message: string; vendorId: number }> {
    const existingVendor = await this.vendorRepository.findByEmail(email);
    if (existingVendor) {
      throw new BadRequestError('Vendor with this email already exists');
    }

    const vendor = Vendor.create({
      email: email.toLowerCase(),
      name: companyName,
      statusId: StatusEnum.ACTIVE,
      cooperativeId: organizationType === 'cooperative' ? organizationId : null,
      districtId: organizationType === 'district' ? organizationId : null
    });

    const createdVendor = await this.vendorRepository.create(vendor);

    await this.prisma.vendorOrganizationApproval.create({
      data: {
        vendorId: createdVendor.id,
        statusId: StatusEnum.PENDING,
        cooperativeId: organizationType === 'cooperative' ? organizationId : null,
        districtId: organizationType === 'district' ? organizationId : null
      }
    });

    return {
      message: 'Vendor registration successful. Awaiting organization approval.',
      vendorId: createdVendor.id
    };
  }

  async getTopLevelOrganizations(): Promise<Array<{ id: number; name: string; type: 'cooperative' | 'district' }>> {
    const cooperatives = await this.prisma.cooperatives.findMany({
      where: { userStatusId: StatusEnum.ACTIVE },
      select: { id: true, name: true }
    });

    const singleDistricts = await this.prisma.district.findMany({
      where: { 
        cooperativeId: null,
        statusId: StatusEnum.ACTIVE,
        isDeleted: false
      },
      select: { id: true, name: true }
    });

    return [
      ...cooperatives.map(coop => ({ id: coop.id, name: coop.name, type: 'cooperative' as const })),
      ...singleDistricts.map(district => ({ id: district.id, name: district.name, type: 'district' as const }))
    ];
  }
}

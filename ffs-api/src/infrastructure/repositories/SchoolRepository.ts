import { inject, injectable } from 'inversify';
import { IDatabaseService } from '../../application/contracts/IDatabaseService';
import { ISchoolRepository } from '../../domain/interfaces/Schools/ISchoolRepository';
import { School } from '../../domain/interfaces/Schools/School';
import TYPES from '../../shared/dependencyInjection/types';
import { PrismaClient } from '@prisma/client';

@injectable()
export class SchoolRepository implements ISchoolRepository {
  private schoolModel: PrismaClient['school'];
  
  constructor(@inject(TYPES.IDatabaseService) database: IDatabaseService) {
    this.schoolModel = database.getClient().school;
  }

  async create(school: School): Promise<School> {
    const createdSchool = await this.schoolModel.create({
      data: {
        districtId: school.districtId,
        name: school.name,
        enrollment: school.enrollment,
        schoolType: school.schoolType,
        addressLine1: school.addressLine1,
        addressLine2: school.addressLine2,
        city: school.city,
        state: school.state,
        zipCode: school.zipCode,
        shippingAddressLine1: school.shippingAddressLine1,
        shippingAddressLine2: school.shippingAddressLine2,
        shippingAddressCity: school.shippingAddressCity,
        shippingAddressState: school.shippingAddressState,
        shippingAddressZipCode: school.shippingAddressZipCode,
        phone: school.phone,
        fax: school.fax,
        email: school.email,
        website: school.website,
        notes: school.notes,
        overrideDistrictBilling: school.overrideDistrictBilling,
        statusId: school.statusId || 1,
        isDeleted: school.isDeleted || false,
      },
    });

    return new School({
      id: createdSchool.id,
      districtId: createdSchool.districtId,
      name: createdSchool.name,
      enrollment: createdSchool.enrollment,
      schoolType: createdSchool.schoolType,
      addressLine1: createdSchool.addressLine1,
      addressLine2: createdSchool.addressLine2,
      city: createdSchool.city,
      state: createdSchool.state,
      zipCode: createdSchool.zipCode,
      shippingAddressLine1: createdSchool.shippingAddressLine1,
      shippingAddressLine2: createdSchool.shippingAddressLine2,
      shippingAddressCity: createdSchool.shippingAddressCity,
      shippingAddressState: createdSchool.shippingAddressState,
      shippingAddressZipCode: createdSchool.shippingAddressZipCode,
      phone: createdSchool.phone,
      fax: createdSchool.fax,
      email: createdSchool.email,
      website: createdSchool.website,
      notes: createdSchool.notes,
      overrideDistrictBilling: createdSchool.overrideDistrictBilling,
      statusId: createdSchool.statusId,
      isDeleted: createdSchool.isDeleted,
      createdAt: createdSchool.createdAt || new Date(),
      updatedAt: createdSchool.updatedAt || new Date(),
    });
  }

  async findById(id: number): Promise<School | null> {
    const school = await this.schoolModel.findUnique({
      where: { id },
    });

    if (!school) return null;

    return new School({
      id: school.id,
      districtId: school.districtId,
      name: school.name,
      enrollment: school.enrollment,
      schoolType: school.schoolType,
      addressLine1: school.addressLine1,
      addressLine2: school.addressLine2,
      city: school.city,
      state: school.state,
      zipCode: school.zipCode,
      shippingAddressLine1: school.shippingAddressLine1,
      shippingAddressLine2: school.shippingAddressLine2,
      shippingAddressCity: school.shippingAddressCity,
      shippingAddressState: school.shippingAddressState,
      shippingAddressZipCode: school.shippingAddressZipCode,
      phone: school.phone,
      email: school.email,
      notes: school.notes,
      overrideDistrictBilling: school.overrideDistrictBilling,
      statusId: school.statusId,
      isDeleted: school.isDeleted,
      createdAt: school.createdAt || new Date(),
    });
  }

  async findByDistrictId(districtId: number): Promise<School[]> {
    const schools = await this.schoolModel.findMany({
      where: { districtId },
    });

    return schools.map(school => new School({
      id: school.id,
      districtId: school.districtId,
      name: school.name,
      enrollment: school.enrollment,
      schoolType: school.schoolType,
      addressLine1: school.addressLine1,
      addressLine2: school.addressLine2,
      city: school.city,
      state: school.state,
      zipCode: school.zipCode,
      shippingAddressLine1: school.shippingAddressLine1,
      shippingAddressLine2: school.shippingAddressLine2,
      shippingAddressCity: school.shippingAddressCity,
      shippingAddressState: school.shippingAddressState,
      shippingAddressZipCode: school.shippingAddressZipCode,
      phone: school.phone,
      email: school.email,
      notes: school.notes,
      overrideDistrictBilling: school.overrideDistrictBilling,
      statusId: school.statusId,
      isDeleted: school.isDeleted,
      createdAt: school.createdAt || new Date(),
    }));
  }

  async findByDistrictIdWithStatus(districtId: number): Promise<School[]> {
    const schools = await this.schoolModel.findMany({
      where: { 
        districtId,
        isDeleted: false 
      },
      include: {
        userStatus: true
      }
    });

    return schools.map(school => new School({
      id: school.id,
      districtId: school.districtId,
      name: school.name,
      enrollment: school.enrollment,
      schoolType: school.schoolType,
      addressLine1: school.addressLine1,
      addressLine2: school.addressLine2,
      city: school.city,
      state: school.state,
      zipCode: school.zipCode,
      shippingAddressLine1: school.shippingAddressLine1,
      shippingAddressLine2: school.shippingAddressLine2,
      shippingAddressCity: school.shippingAddressCity,
      shippingAddressState: school.shippingAddressState,
      shippingAddressZipCode: school.shippingAddressZipCode,
      phone: school.phone,
      email: school.email,
      notes: school.notes,
      overrideDistrictBilling: school.overrideDistrictBilling,
      statusId: school.statusId,
      isDeleted: school.isDeleted,
      createdAt: school.createdAt || new Date(),
      userStatuses: school.userStatus ? {
        id: school.userStatus.id,
        name: school.userStatus.name
      } : undefined,
    }));
  }

  async update(school: School): Promise<School | null> {
    if (!school.id) return null;

    const updatedSchool = await this.schoolModel.update({
      where: { id: school.id },
      data: {
        name: school.name,
        enrollment: school.enrollment,
        schoolType: school.schoolType,
        addressLine1: school.addressLine1,
        addressLine2: school.addressLine2,
        city: school.city,
        state: school.state,
        zipCode: school.zipCode,
        shippingAddressLine1: school.shippingAddressLine1,
        shippingAddressLine2: school.shippingAddressLine2,
        shippingAddressCity: school.shippingAddressCity,
        shippingAddressState: school.shippingAddressState,
        shippingAddressZipCode: school.shippingAddressZipCode,
        phone: school.phone,
        email: school.email,
        notes: school.notes,
        overrideDistrictBilling: school.overrideDistrictBilling,
        statusId: school.statusId,
        isDeleted: school.isDeleted,
      },

    });

    return new School({
      id: updatedSchool.id,
      districtId: updatedSchool.districtId,
      name: updatedSchool.name,
      enrollment: updatedSchool.enrollment,
      schoolType: updatedSchool.schoolType,
      addressLine1: updatedSchool.addressLine1,
      addressLine2: updatedSchool.addressLine2,
      city: updatedSchool.city,
      state: updatedSchool.state,
      zipCode: updatedSchool.zipCode,
      shippingAddressLine1: updatedSchool.shippingAddressLine1,
      shippingAddressLine2: updatedSchool.shippingAddressLine2,
      shippingAddressCity: updatedSchool.shippingAddressCity,
      shippingAddressState: updatedSchool.shippingAddressState,
      shippingAddressZipCode: updatedSchool.shippingAddressZipCode,
      phone: updatedSchool.phone,
      email: updatedSchool.email,
      notes: updatedSchool.notes,
      overrideDistrictBilling: updatedSchool.overrideDistrictBilling,
      statusId: updatedSchool.statusId,
      isDeleted: updatedSchool.isDeleted,
      createdAt: updatedSchool.createdAt || new Date(),

    });
  }

  async createWithTransaction(prisma: PrismaClient, school: School): Promise<School> {
    const createdSchool = await prisma.school.create({
      data: {
        districtId: school.districtId,
        name: school.name,
        enrollment: school.enrollment,
        schoolType: school.schoolType,
        addressLine1: school.addressLine1,
        addressLine2: school.addressLine2,
        city: school.city,
        state: school.state,
        zipCode: school.zipCode,
        shippingAddressLine1: school.shippingAddressLine1,
        shippingAddressLine2: school.shippingAddressLine2,
        shippingAddressCity: school.shippingAddressCity,
        shippingAddressState: school.shippingAddressState,
        shippingAddressZipCode: school.shippingAddressZipCode,
        phone: school.phone,
        fax: school.fax,
        email: school.email,
        website: school.website,
        notes: school.notes,
        overrideDistrictBilling: school.overrideDistrictBilling,
        statusId: school.statusId || 1,
        isDeleted: school.isDeleted || false,
      },
    });

    return new School({
      id: createdSchool.id,
      districtId: createdSchool.districtId,
      name: createdSchool.name,
      enrollment: createdSchool.enrollment,
      schoolType: createdSchool.schoolType,
      addressLine1: createdSchool.addressLine1,
      addressLine2: createdSchool.addressLine2,
      city: createdSchool.city,
      state: createdSchool.state,
      zipCode: createdSchool.zipCode,
      shippingAddressLine1: createdSchool.shippingAddressLine1,
      shippingAddressLine2: createdSchool.shippingAddressLine2,
      shippingAddressCity: createdSchool.shippingAddressCity,
      shippingAddressState: createdSchool.shippingAddressState,
      shippingAddressZipCode: createdSchool.shippingAddressZipCode,
      phone: createdSchool.phone,
      fax: createdSchool.fax,
      email: createdSchool.email,
      website: createdSchool.website,
      notes: createdSchool.notes,
      overrideDistrictBilling: createdSchool.overrideDistrictBilling,
      statusId: createdSchool.statusId,
      isDeleted: createdSchool.isDeleted,
      createdAt: createdSchool.createdAt || new Date(),
      updatedAt: createdSchool.updatedAt || new Date(),
    });
  }

  async updateWithTransaction(prisma: PrismaClient, school: School): Promise<School | null> {
    if (!school.id) return null;

    const updatedSchool = await prisma.school.update({
      where: { id: school.id },
      data: {
        name: school.name,
        enrollment: school.enrollment,
        schoolType: school.schoolType,
        addressLine1: school.addressLine1,
        addressLine2: school.addressLine2,
        city: school.city,
        state: school.state,
        zipCode: school.zipCode,
        shippingAddressLine1: school.shippingAddressLine1,
        shippingAddressLine2: school.shippingAddressLine2,
        shippingAddressCity: school.shippingAddressCity,
        shippingAddressState: school.shippingAddressState,
        shippingAddressZipCode: school.shippingAddressZipCode,
        phone: school.phone,
        fax: school.fax,
        email: school.email,
        website: school.website,
        notes: school.notes,
        overrideDistrictBilling: school.overrideDistrictBilling,
        statusId: school.statusId,
        isDeleted: school.isDeleted,
      },
    });

    return new School({
      id: updatedSchool.id,
      districtId: updatedSchool.districtId,
      name: updatedSchool.name,
      enrollment: updatedSchool.enrollment,
      schoolType: updatedSchool.schoolType,
      addressLine1: updatedSchool.addressLine1,
      addressLine2: updatedSchool.addressLine2,
      city: updatedSchool.city,
      state: updatedSchool.state,
      zipCode: updatedSchool.zipCode,
      shippingAddressLine1: updatedSchool.shippingAddressLine1,
      shippingAddressLine2: updatedSchool.shippingAddressLine2,
      shippingAddressCity: updatedSchool.shippingAddressCity,
      shippingAddressState: updatedSchool.shippingAddressState,
      shippingAddressZipCode: updatedSchool.shippingAddressZipCode,
      phone: updatedSchool.phone,
      fax: updatedSchool.fax,
      email: updatedSchool.email,
      website: updatedSchool.website,
      notes: updatedSchool.notes,
      overrideDistrictBilling: updatedSchool.overrideDistrictBilling,
      statusId: updatedSchool.statusId,
      isDeleted: updatedSchool.isDeleted,
      createdAt: updatedSchool.createdAt || new Date(),
      updatedAt: updatedSchool.updatedAt || new Date(),
    });
  }

  async softDelete(id: number): Promise<void> {
    try {
      await this.schoolModel.update({
        where: { id },
        data: { isDeleted: true }
      });
    } catch (error) {
      console.error('Error soft deleting school:', error);
      throw error;
    }
  }
}

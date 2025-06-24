import { inject, injectable } from 'inversify';
import { PrismaClient } from '@prisma/client';
import { Cooperative } from '../../domain/interfaces/Cooperatives/Cooperative';
import { ICooperativeRepository } from '../../domain/interfaces/Cooperatives/ICooperativeRepository';
import { IDatabaseService } from '../../application/contracts/IDatabaseService';
import TYPES from '../../shared/dependencyInjection/types';

@injectable()
export class CooperativeRepository implements ICooperativeRepository {
  private prisma: PrismaClient;

  constructor(@inject(TYPES.IDatabaseService) databaseService: IDatabaseService) {
    this.prisma = databaseService.getClient();
  }

  async create(cooperative: Cooperative): Promise<Cooperative> {
    const createdCooperative = await this.prisma.cooperatives.create({
      data: {
        code: cooperative.code,
        name: cooperative.name,
        organizationTypeId: cooperative.organizationTypeId,
        address: cooperative.address,
        city: cooperative.city,
        state: cooperative.state,
        zip: cooperative.zip,
        phone: cooperative.phone,
        fax: cooperative.fax,
        email: cooperative.email,
        website: cooperative.website,
        logo: cooperative.logo,
        description: cooperative.description,
        enrollment: cooperative.enrollment,
        location: cooperative.location,
        directorsName: cooperative.directorsName,
        raNumber: cooperative.raNumber,
        superintendent: cooperative.superintendent,
        established: cooperative.established,
        userStatusId: cooperative.userStatusId,
        budget: cooperative.budget,
        lastUpdated: cooperative.lastUpdated,
        participatingIn: cooperative.participatingIn,
        shippingAddress: cooperative.shippingAddress,
        notes: cooperative.notes,
      },
      include: {
        organizationType: true,
        userStatus: true,
      },
    });

    return new Cooperative({
      id: createdCooperative.id,
      code: createdCooperative.code,
      name: createdCooperative.name,
      organizationTypeId: createdCooperative.organizationTypeId,
      address: createdCooperative.address ?? undefined,
      city: createdCooperative.city ?? undefined,
      state: createdCooperative.state ?? undefined,
      zip: createdCooperative.zip ?? undefined,
      phone: createdCooperative.phone ?? undefined,
      fax: createdCooperative.fax ?? undefined,
      email: createdCooperative.email ?? undefined,
      website: createdCooperative.website ?? undefined,
      logo: createdCooperative.logo ?? undefined,
      description: createdCooperative.description ?? undefined,
      enrollment: createdCooperative.enrollment ?? undefined,
      location: createdCooperative.location ?? undefined,
      directorsName: createdCooperative.directorsName ?? undefined,
      raNumber: createdCooperative.raNumber ?? undefined,
      superintendent: createdCooperative.superintendent ?? undefined,
      established: createdCooperative.established ?? undefined,
      userStatusId: createdCooperative.userStatusId,
      budget: createdCooperative.budget ? Number(createdCooperative.budget) : undefined,
      lastUpdated: createdCooperative.lastUpdated ?? undefined,
      participatingIn: createdCooperative.participatingIn ?? undefined,
      shippingAddress: createdCooperative.shippingAddress ?? undefined,
      notes: createdCooperative.notes ?? undefined,
      createdAt: createdCooperative.createdAt,
      updatedAt: createdCooperative.updatedAt,
      organizationType: createdCooperative.organizationType,
      userStatus: createdCooperative.userStatus,
    });
  }

  async findById(id: number): Promise<Cooperative | null> {
    const cooperative = await this.prisma.cooperatives.findUnique({
      where: { id },
      include: {
        organizationType: true,
        userStatus: true,
      },
    });

    if (!cooperative) {
      return null;
    }

    return new Cooperative({
      id: cooperative.id,
      code: cooperative.code,
      name: cooperative.name,
      organizationTypeId: cooperative.organizationTypeId,
      address: cooperative.address ?? undefined,
      city: cooperative.city ?? undefined,
      state: cooperative.state ?? undefined,
      zip: cooperative.zip ?? undefined,
      phone: cooperative.phone ?? undefined,
      fax: cooperative.fax ?? undefined,
      email: cooperative.email ?? undefined,
      website: cooperative.website ?? undefined,
      logo: cooperative.logo ?? undefined,
      description: cooperative.description ?? undefined,
      enrollment: cooperative.enrollment ?? undefined,
      location: cooperative.location ?? undefined,
      directorsName: cooperative.directorsName ?? undefined,
      raNumber: cooperative.raNumber ?? undefined,
      superintendent: cooperative.superintendent ?? undefined,
      established: cooperative.established ?? undefined,
      userStatusId: cooperative.userStatusId,
      budget: cooperative.budget ? Number(cooperative.budget) : undefined,
      lastUpdated: cooperative.lastUpdated ?? undefined,
      participatingIn: cooperative.participatingIn ?? undefined,
      shippingAddress: cooperative.shippingAddress ?? undefined,
      notes: cooperative.notes ?? undefined,
      createdAt: cooperative.createdAt,
      updatedAt: cooperative.updatedAt,
      organizationType: cooperative.organizationType,
      userStatus: cooperative.userStatus,
    });
  }

  async findByCode(code: string): Promise<Cooperative | null> {
    const cooperative = await this.prisma.cooperatives.findUnique({
      where: { code },
      include: {
        organizationType: true,
        userStatus: true,
      },
    });

    if (!cooperative) {
      return null;
    }

    return new Cooperative({
      id: cooperative.id,
      code: cooperative.code,
      name: cooperative.name,
      organizationTypeId: cooperative.organizationTypeId,
      address: cooperative.address ?? undefined,
      city: cooperative.city ?? undefined,
      state: cooperative.state ?? undefined,
      zip: cooperative.zip ?? undefined,
      phone: cooperative.phone ?? undefined,
      fax: cooperative.fax ?? undefined,
      email: cooperative.email ?? undefined,
      website: cooperative.website ?? undefined,
      logo: cooperative.logo ?? undefined,
      description: cooperative.description ?? undefined,
      enrollment: cooperative.enrollment ?? undefined,
      location: cooperative.location ?? undefined,
      directorsName: cooperative.directorsName ?? undefined,
      raNumber: cooperative.raNumber ?? undefined,
      superintendent: cooperative.superintendent ?? undefined,
      established: cooperative.established ?? undefined,
      userStatusId: cooperative.userStatusId,
      budget: cooperative.budget ? Number(cooperative.budget) : undefined,
      lastUpdated: cooperative.lastUpdated ?? undefined,
      participatingIn: cooperative.participatingIn ?? undefined,
      shippingAddress: cooperative.shippingAddress ?? undefined,
      notes: cooperative.notes ?? undefined,
      createdAt: cooperative.createdAt,
      updatedAt: cooperative.updatedAt,
      organizationType: cooperative.organizationType,
      userStatus: cooperative.userStatus,
    });
  }

  async findAll(): Promise<Cooperative[]> {
    const cooperatives = await this.prisma.cooperatives.findMany({
      include: {
        organizationType: true,
        userStatus: true,
      },
    });

    return cooperatives.map(cooperative => new Cooperative({
      id: cooperative.id,
      code: cooperative.code,
      name: cooperative.name,
      organizationTypeId: cooperative.organizationTypeId,
      address: cooperative.address ?? undefined,
      city: cooperative.city ?? undefined,
      state: cooperative.state ?? undefined,
      zip: cooperative.zip ?? undefined,
      phone: cooperative.phone ?? undefined,
      fax: cooperative.fax ?? undefined,
      email: cooperative.email ?? undefined,
      website: cooperative.website ?? undefined,
      logo: cooperative.logo ?? undefined,
      description: cooperative.description ?? undefined,
      enrollment: cooperative.enrollment ?? undefined,
      location: cooperative.location ?? undefined,
      directorsName: cooperative.directorsName ?? undefined,
      raNumber: cooperative.raNumber ?? undefined,
      superintendent: cooperative.superintendent ?? undefined,
      established: cooperative.established ?? undefined,
      userStatusId: cooperative.userStatusId,
      budget: cooperative.budget ? Number(cooperative.budget) : undefined,
      lastUpdated: cooperative.lastUpdated ?? undefined,
      participatingIn: cooperative.participatingIn ?? undefined,
      shippingAddress: cooperative.shippingAddress ?? undefined,
      notes: cooperative.notes ?? undefined,
      createdAt: cooperative.createdAt,
      updatedAt: cooperative.updatedAt,
      organizationType: cooperative.organizationType,
      userStatus: cooperative.userStatus,
    }));
  }

  async update(cooperative: Cooperative): Promise<Cooperative> {
    const updatedCooperative = await this.prisma.cooperatives.update({
      where: { id: cooperative.id },
      data: {
        code: cooperative.code,
        name: cooperative.name,
        organizationTypeId: cooperative.organizationTypeId,
        address: cooperative.address,
        city: cooperative.city,
        state: cooperative.state,
        zip: cooperative.zip,
        phone: cooperative.phone,
        fax: cooperative.fax,
        email: cooperative.email,
        website: cooperative.website,
        logo: cooperative.logo,
        description: cooperative.description,
        enrollment: cooperative.enrollment,
        location: cooperative.location,
        directorsName: cooperative.directorsName,
        raNumber: cooperative.raNumber,
        superintendent: cooperative.superintendent,
        established: cooperative.established,
        userStatusId: cooperative.userStatusId,
        budget: cooperative.budget,
        lastUpdated: cooperative.lastUpdated,
        participatingIn: cooperative.participatingIn,
        shippingAddress: cooperative.shippingAddress,
        notes: cooperative.notes,
      },
      include: {
        organizationType: true,
        userStatus: true,
      },
    });

    return new Cooperative({
      id: updatedCooperative.id,
      code: updatedCooperative.code,
      name: updatedCooperative.name,
      organizationTypeId: updatedCooperative.organizationTypeId,
      address: updatedCooperative.address ?? undefined,
      city: updatedCooperative.city ?? undefined,
      state: updatedCooperative.state ?? undefined,
      zip: updatedCooperative.zip ?? undefined,
      phone: updatedCooperative.phone ?? undefined,
      fax: updatedCooperative.fax ?? undefined,
      email: updatedCooperative.email ?? undefined,
      website: updatedCooperative.website ?? undefined,
      logo: updatedCooperative.logo ?? undefined,
      description: updatedCooperative.description ?? undefined,
      enrollment: updatedCooperative.enrollment ?? undefined,
      location: updatedCooperative.location ?? undefined,
      directorsName: updatedCooperative.directorsName ?? undefined,
      raNumber: updatedCooperative.raNumber ?? undefined,
      superintendent: updatedCooperative.superintendent ?? undefined,
      established: updatedCooperative.established ?? undefined,
      userStatusId: updatedCooperative.userStatusId,
      budget: updatedCooperative.budget ? Number(updatedCooperative.budget) : undefined,
      lastUpdated: updatedCooperative.lastUpdated ?? undefined,
      participatingIn: updatedCooperative.participatingIn ?? undefined,
      shippingAddress: updatedCooperative.shippingAddress ?? undefined,
      notes: updatedCooperative.notes ?? undefined,
      createdAt: updatedCooperative.createdAt,
      updatedAt: updatedCooperative.updatedAt,
      organizationType: updatedCooperative.organizationType,
      userStatus: updatedCooperative.userStatus,
    });
  }

  async createWithTransaction(prisma: PrismaClient, cooperative: Cooperative): Promise<Cooperative> {
    const createdCooperative = await prisma.cooperatives.create({
      data: {
        code: cooperative.code,
        name: cooperative.name,
        organizationTypeId: cooperative.organizationTypeId,
        address: cooperative.address,
        city: cooperative.city,
        state: cooperative.state,
        zip: cooperative.zip,
        phone: cooperative.phone,
        fax: cooperative.fax,
        email: cooperative.email,
        website: cooperative.website,
        logo: cooperative.logo,
        description: cooperative.description,
        enrollment: cooperative.enrollment,
        location: cooperative.location,
        directorsName: cooperative.directorsName,
        raNumber: cooperative.raNumber,
        superintendent: cooperative.superintendent,
        established: cooperative.established,
        userStatusId: cooperative.userStatusId,
        budget: cooperative.budget,
        lastUpdated: cooperative.lastUpdated,
        participatingIn: cooperative.participatingIn,
        shippingAddress: cooperative.shippingAddress,
        notes: cooperative.notes,
      },
      include: {
        organizationType: true,
        userStatus: true,
      },
    });

    return new Cooperative({
      id: createdCooperative.id,
      code: createdCooperative.code,
      name: createdCooperative.name,
      organizationTypeId: createdCooperative.organizationTypeId,
      address: createdCooperative.address ?? undefined,
      city: createdCooperative.city ?? undefined,
      state: createdCooperative.state ?? undefined,
      zip: createdCooperative.zip ?? undefined,
      phone: createdCooperative.phone ?? undefined,
      fax: createdCooperative.fax ?? undefined,
      email: createdCooperative.email ?? undefined,
      website: createdCooperative.website ?? undefined,
      logo: createdCooperative.logo ?? undefined,
      description: createdCooperative.description ?? undefined,
      enrollment: createdCooperative.enrollment ?? undefined,
      location: createdCooperative.location ?? undefined,
      directorsName: createdCooperative.directorsName ?? undefined,
      raNumber: createdCooperative.raNumber ?? undefined,
      superintendent: createdCooperative.superintendent ?? undefined,
      established: createdCooperative.established ?? undefined,
      userStatusId: createdCooperative.userStatusId,
      budget: createdCooperative.budget ? Number(createdCooperative.budget) : undefined,
      lastUpdated: createdCooperative.lastUpdated ?? undefined,
      participatingIn: createdCooperative.participatingIn ?? undefined,
      shippingAddress: createdCooperative.shippingAddress ?? undefined,
      notes: createdCooperative.notes ?? undefined,
      createdAt: createdCooperative.createdAt,
      updatedAt: createdCooperative.updatedAt,
      organizationType: createdCooperative.organizationType,
      userStatus: createdCooperative.userStatus,
    });
  }

  async updateWithTransaction(prisma: PrismaClient, cooperative: Cooperative): Promise<Cooperative> {
    const updatedCooperative = await prisma.cooperatives.update({
      where: { id: cooperative.id },
      data: {
        code: cooperative.code,
        name: cooperative.name,
        organizationTypeId: cooperative.organizationTypeId,
        address: cooperative.address,
        city: cooperative.city,
        state: cooperative.state,
        zip: cooperative.zip,
        phone: cooperative.phone,
        fax: cooperative.fax,
        email: cooperative.email,
        website: cooperative.website,
        logo: cooperative.logo,
        description: cooperative.description,
        enrollment: cooperative.enrollment,
        location: cooperative.location,
        directorsName: cooperative.directorsName,
        raNumber: cooperative.raNumber,
        superintendent: cooperative.superintendent,
        established: cooperative.established,
        userStatusId: cooperative.userStatusId,
        budget: cooperative.budget,
        lastUpdated: cooperative.lastUpdated,
        participatingIn: cooperative.participatingIn,
        shippingAddress: cooperative.shippingAddress,
        notes: cooperative.notes,
      },
      include: {
        organizationType: true,
        userStatus: true,
      },
    });

    return new Cooperative({
      id: updatedCooperative.id,
      code: updatedCooperative.code,
      name: updatedCooperative.name,
      organizationTypeId: updatedCooperative.organizationTypeId,
      address: updatedCooperative.address ?? undefined,
      city: updatedCooperative.city ?? undefined,
      state: updatedCooperative.state ?? undefined,
      zip: updatedCooperative.zip ?? undefined,
      phone: updatedCooperative.phone ?? undefined,
      fax: updatedCooperative.fax ?? undefined,
      email: updatedCooperative.email ?? undefined,
      website: updatedCooperative.website ?? undefined,
      logo: updatedCooperative.logo ?? undefined,
      description: updatedCooperative.description ?? undefined,
      enrollment: updatedCooperative.enrollment ?? undefined,
      location: updatedCooperative.location ?? undefined,
      directorsName: updatedCooperative.directorsName ?? undefined,
      raNumber: updatedCooperative.raNumber ?? undefined,
      superintendent: updatedCooperative.superintendent ?? undefined,
      established: updatedCooperative.established ?? undefined,
      userStatusId: updatedCooperative.userStatusId,
      budget: updatedCooperative.budget ? Number(updatedCooperative.budget) : undefined,
      lastUpdated: updatedCooperative.lastUpdated ?? undefined,
      participatingIn: updatedCooperative.participatingIn ?? undefined,
      shippingAddress: updatedCooperative.shippingAddress ?? undefined,
      notes: updatedCooperative.notes ?? undefined,
      createdAt: updatedCooperative.createdAt,
      updatedAt: updatedCooperative.updatedAt,
      organizationType: updatedCooperative.organizationType,
      userStatus: updatedCooperative.userStatus,
    });
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.cooperatives.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }
}

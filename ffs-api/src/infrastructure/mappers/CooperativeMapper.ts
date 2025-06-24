import { Cooperative } from '../../domain/interfaces/Cooperatives/Cooperative';
import { OrganizationType } from '../../domain/interfaces/organizationTypes/OrganizationType';
import { UserStatus } from '../../domain/interfaces/userStatuses/UserStatus';

export class CooperativeMapper {
  static toPrisma(entity: Cooperative) {
    return {
      id: entity.id,
      code: entity.code,
      name: entity.name,
      organizationTypeId: entity.organizationTypeId,
      address: entity.address,
      city: entity.city,
      state: entity.state,
      zip: entity.zip,
      phone: entity.phone,
      fax: entity.fax,
      email: entity.email,
      website: entity.website,
      logo: entity.logo,
      description: entity.description,
      enrollment: entity.enrollment,
      location: entity.location,
      directorsName: entity.directorsName,
      raNumber: entity.raNumber,
      superintendent: entity.superintendent,
      established: entity.established,
      userStatusId: entity.userStatusId,
      budget: entity.budget,
      lastUpdated: entity.lastUpdated,
      participatingIn: entity.participatingIn,
      shippingAddress: entity.shippingAddress,
      notes: entity.notes,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static toDomain(prismaModel: {
    id: number;
    code: string;
    name: string;
    organizationTypeId: number;
    address: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
    phone: string | null;
    fax: string | null;
    email: string | null;
    website: string | null;
    logo: string | null;
    description: string | null;
    enrollment: number | null;
    location: string | null;
    directorsName: string | null;
    raNumber: string | null;
    superintendent: string | null;
    established: number | null;
    userStatusId: number;
    budget: number | null;
    lastUpdated: Date | null;
    participatingIn: string | null;
    shippingAddress: string | null;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
    organizationType?: { id: number; name: string };
    userStatus?: { id: number; name: string };
  }): Cooperative {
    return new Cooperative({
      id: prismaModel.id,
      code: prismaModel.code,
      name: prismaModel.name,
      organizationTypeId: prismaModel.organizationTypeId,
      address: prismaModel.address ?? undefined,
      city: prismaModel.city ?? undefined,
      state: prismaModel.state ?? undefined,
      zip: prismaModel.zip ?? undefined,
      phone: prismaModel.phone ?? undefined,
      fax: prismaModel.fax ?? undefined,
      email: prismaModel.email ?? undefined,
      website: prismaModel.website ?? undefined,
      logo: prismaModel.logo ?? undefined,
      description: prismaModel.description ?? undefined,
      enrollment: prismaModel.enrollment ?? undefined,
      location: prismaModel.location ?? undefined,
      directorsName: prismaModel.directorsName ?? undefined,
      raNumber: prismaModel.raNumber ?? undefined,
      superintendent: prismaModel.superintendent ?? undefined,
      established: prismaModel.established ?? undefined,
      userStatusId: prismaModel.userStatusId,
      budget: prismaModel.budget ?? undefined,
      lastUpdated: prismaModel.lastUpdated ?? undefined,
      participatingIn: prismaModel.participatingIn ?? undefined,
      shippingAddress: prismaModel.shippingAddress ?? undefined,
      notes: prismaModel.notes ?? undefined,
      createdAt: prismaModel.createdAt,
      updatedAt: prismaModel.updatedAt,
      organizationType: prismaModel.organizationType ? new OrganizationType({
        id: prismaModel.organizationType.id,
        name: prismaModel.organizationType.name,
      }) : undefined,
      userStatus: prismaModel.userStatus ? new UserStatus({
        id: prismaModel.userStatus.id,
        name: prismaModel.userStatus.name,
      }) : undefined,
    });
  }
}

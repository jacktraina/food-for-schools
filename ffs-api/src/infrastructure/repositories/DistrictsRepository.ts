import { inject, injectable } from "inversify";
import { IDatabaseService } from "../../application/contracts/IDatabaseService";
import TYPES from "../../shared/dependencyInjection/types";
import { PrismaClient } from "@prisma/client";
import { IDistrictRepository } from "../../domain/interfaces/Districts/IDistrictRepository";
import { District } from "../../domain/interfaces/Districts/District";
import { Decimal } from "@prisma/client/runtime/library";
import { DistrictMapper } from "../mappers/DistrictMapper";
import { UserStatus } from "../../domain/interfaces/userStatuses/UserStatus";

@injectable()
export class DistrictRepository implements IDistrictRepository {
  private districtModel: PrismaClient["district"];

  constructor(@inject(TYPES.IDatabaseService) database: IDatabaseService) {
    this.districtModel = database.getClient().district;
  }

  async create(district: District): Promise<District> {
    try {
      const createdDistrict = await this.districtModel.create({
        data: {
          name: district.name,
          location: district.location,
          directorName: district.directorName,
          streetAddress1: district.streetAddress1,
          streetAddress2: district.streetAddress2,
          city: district.city,
          state: district.state,
          zipCode: district.zipCode,
          phone: district.phone,
          email: district.email,
          fax: district.fax,
          website: district.website,
          districtEnrollment: district.districtEnrollment,
          raNumber: district.raNumber,
          numberOfSchools: district.numberOfSchools,
          numberOfStudents: district.numberOfStudents,
          annualBudget: district.annualBudget ? new Decimal(district.annualBudget) : null,
          superintendentName: district.superintendentName,
          establishedYear: district.establishedYear,
          statusId: district.statusId,
          cooperativeId: district.cooperativeId,
          code: district.code,
          participatingIn: district.participatingIn,
          shippingAddress: district.shippingAddress,
          description: district.description,
          notes: district.notes,
        },
        select: {
          id: true,
          name: true,
          location: true,
          directorName: true,
          streetAddress1: true,
          streetAddress2: true,
          city: true,
          state: true,
          zipCode: true,
          phone: true,
          email: true,
          fax: true,
          website: true,
          districtEnrollment: true,
          raNumber: true,
          numberOfSchools: true,
          numberOfStudents: true,
          annualBudget: true,
          superintendentName: true,
          establishedYear: true,
          statusId: true,
          cooperativeId: true,
          code: true,
          participatingIn: true,
          shippingAddress: true,
          description: true,
          notes: true,
          isDeleted: true,
        },
      });

      return new District({
        id: createdDistrict.id,
        name: createdDistrict.name,
        location: createdDistrict.location,
        directorName: createdDistrict.directorName,
        streetAddress1: createdDistrict.streetAddress1,
        streetAddress2: createdDistrict.streetAddress2,
        city: createdDistrict.city,
        state: createdDistrict.state,
        zipCode: createdDistrict.zipCode,
        phone: createdDistrict.phone,
        email: createdDistrict.email,
        fax: createdDistrict.fax,
        website: createdDistrict.website,
        districtEnrollment: createdDistrict.districtEnrollment,
        raNumber: createdDistrict.raNumber,
        numberOfSchools: createdDistrict.numberOfSchools,
        numberOfStudents: createdDistrict.numberOfStudents,
        annualBudget: createdDistrict.annualBudget
          ? typeof createdDistrict.annualBudget === "object" &&
            "toNumber" in createdDistrict.annualBudget
            ? createdDistrict.annualBudget.toNumber()
            : Number(createdDistrict.annualBudget)
          : undefined,
        superintendentName: createdDistrict.superintendentName,
        establishedYear: createdDistrict.establishedYear,
        statusId: createdDistrict.statusId,
        cooperativeId: createdDistrict.cooperativeId || null,
        code: createdDistrict.code || null,
        updatedAt: new Date(),
        participatingIn: createdDistrict.participatingIn || null,
        shippingAddress: createdDistrict.shippingAddress || null,
        description: createdDistrict.description || null,
        notes: createdDistrict.notes || null,
        isDeleted: createdDistrict.isDeleted,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("Unique constraint")) {
        throw new Error("A district with this code already exists");
      }
      throw error;
    }
  }

  async findAll(): Promise<District[]> {
    const districts = await this.districtModel.findMany({
      where: {
        isDeleted: false,
      },
      include: {
        userStatus: true,
      },
    });

    return districts.map((district) => {
      return new District({
        id: district.id,
        name: district.name,
        location: district.location ?? null,
        directorName: district.directorName ?? null,
        streetAddress1: district.streetAddress1 ?? null,
        streetAddress2: district.streetAddress2 ?? null,
        city: district.city ?? null,
        state: district.state ?? null,
        zipCode: district.zipCode ?? null,
        phone: district.phone ?? null,
        email: district.email ?? null,
        fax: district.fax ?? null,
        website: district.website ?? null,
        districtEnrollment: district.districtEnrollment ?? null,
        raNumber: district.raNumber ?? null,
        numberOfSchools: district.numberOfSchools ?? null,
        numberOfStudents: district.numberOfStudents ?? null,
        annualBudget: district.annualBudget
          ? typeof district.annualBudget === "object" && "toNumber" in district.annualBudget
            ? district.annualBudget.toNumber()
            : Number(district.annualBudget)
          : null,
        superintendentName: district.superintendentName ?? null,
        establishedYear: district.establishedYear ?? null,
        statusId: district.statusId,
        cooperativeId: district.cooperativeId ?? null,
        code: district.code ?? null,
        createdAt: district.createdAt ?? new Date(),
        updatedAt: district.updatedAt ?? undefined,
        participatingIn: district.participatingIn ?? null,
        shippingAddress: district.shippingAddress ?? null,
        description: district.description ?? null,
        notes: district.notes ?? null,
        isDeleted: district.isDeleted ?? false,
        userStatus: district.userStatus
          ? new UserStatus({
              id: district.userStatus.id,
              name: district.userStatus.name,
            })
          : undefined,
        districtProducts: [],
        schools: [],
        bids: [],
        invitations: [],
        organizationContacts: [],
        scopes: [],
        users: [],
        vendorOrganizationApprovals: [],
      });
    });
  }

  async findByIds(districtId: number): Promise<District | null> {
    const district = await this.districtModel.findFirst({
      where: {
        id: districtId,
        isDeleted: false,
      },
      include: {
        userStatus: true,
      },
    });

    if (!district) return null;

    return new District({
      id: district.id,
      name: district.name,
      location: district.location ?? null,
      directorName: district.directorName ?? null,
      streetAddress1: district.streetAddress1 ?? null,
      streetAddress2: district.streetAddress2 ?? null,
      city: district.city ?? null,
      state: district.state ?? null,
      zipCode: district.zipCode ?? null,
      phone: district.phone ?? null,
      email: district.email ?? null,
      fax: district.fax ?? null,
      website: district.website ?? null,
      districtEnrollment: district.districtEnrollment ?? null,
      raNumber: district.raNumber ?? null,
      numberOfSchools: district.numberOfSchools ?? null,
      numberOfStudents: district.numberOfStudents ?? null,
      annualBudget: district.annualBudget
        ? typeof district.annualBudget === "object" && "toNumber" in district.annualBudget
          ? district.annualBudget.toNumber()
          : Number(district.annualBudget)
        : null,
      superintendentName: district.superintendentName ?? null,
      establishedYear: district.establishedYear ?? null,
      statusId: district.statusId,
      cooperativeId: district.cooperativeId ?? null,
      code: district.code ?? null,
      createdAt: district.createdAt ?? new Date(),
      updatedAt: district.updatedAt ?? undefined,
      participatingIn: district.participatingIn ?? null,
      shippingAddress: district.shippingAddress ?? null,
      description: district.description ?? null,
      notes: district.notes ?? null,
      isDeleted: district.isDeleted ?? false,
      userStatus: district.userStatus
        ? new UserStatus({
            id: district.userStatus.id,
            name: district.userStatus.name,
          })
        : undefined,
      districtProducts: [],
      schools: [],
      bids: [],
      invitations: [],
      organizationContacts: [],
      scopes: [],
      users: [],
      vendorOrganizationApprovals: [],
    });
  }

  async findById(districtId: number): Promise<District | null> {
    const district = await this.districtModel.findUnique({
      where: {
        id: districtId,
        isDeleted: false,
      },
      include: {
        userStatus: true,
      },
    });

    if (!district) return null;

    return new District({
      id: district.id,
      name: district.name,
      location: district.location ?? null,
      directorName: district.directorName ?? null,
      streetAddress1: district.streetAddress1 ?? null,
      streetAddress2: district.streetAddress2 ?? null,
      city: district.city ?? null,
      state: district.state ?? null,
      zipCode: district.zipCode ?? null,
      phone: district.phone ?? null,
      email: district.email ?? null,
      fax: district.fax ?? null,
      website: district.website ?? null,
      districtEnrollment: district.districtEnrollment ?? null,
      raNumber: district.raNumber ?? null,
      numberOfSchools: district.numberOfSchools ?? null,
      numberOfStudents: district.numberOfStudents ?? null,
      annualBudget: district.annualBudget
        ? typeof district.annualBudget === "object" && "toNumber" in district.annualBudget
          ? district.annualBudget.toNumber()
          : Number(district.annualBudget)
        : null,
      superintendentName: district.superintendentName ?? null,
      establishedYear: district.establishedYear ?? null,
      statusId: district.statusId,
      cooperativeId: district.cooperativeId ?? null,
      code: district.code ?? null,
      createdAt: district.createdAt ?? new Date(),
      updatedAt: district.updatedAt ?? undefined,
      participatingIn: district.participatingIn ?? null,
      shippingAddress: district.shippingAddress ?? null,
      description: district.description ?? null,
      notes: district.notes ?? null,
      isDeleted: district.isDeleted ?? false,
      userStatus: district.userStatus
        ? new UserStatus({
            id: district.userStatus.id,
            name: district.userStatus.name,
          })
        : undefined,
      districtProducts: [],
      schools: [],
      bids: [],
      invitations: [],
      organizationContacts: [],
      scopes: [],
      users: [],
      vendorOrganizationApprovals: [],
    });
  }

  async update(district: District): Promise<void> {
    try {
      const data = DistrictMapper.toPrismaUpdate(district);

      await this.districtModel.update({
        where: { id: district.id },
        data,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("Unique constraint")) {
        throw new Error("A district with this code already exists");
      }
      throw error;
    }
  }

  async updateWithTransaction(prisma: PrismaClient, district: District): Promise<void> {
    try {
      const data = DistrictMapper.toPrismaUpdate(district);

      await prisma.district.update({
        where: { id: district.id },
        data,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("Unique constraint")) {
        throw new Error("A district with this code already exists");
      }
      throw error;
    }
  }

  async findByCooperativeId(cooperativeId: number): Promise<District[]> {
    const districts = await this.districtModel.findMany({
      where: {
        isDeleted: false,
        cooperativeId: cooperativeId,
      },
      include: {
        userStatus: true,
      },
    });

    return districts.map((district) => {
      return new District({
        id: district.id,
        name: district.name,
        location: district.location ?? null,
        directorName: district.directorName ?? null,
        streetAddress1: district.streetAddress1 ?? null,
        streetAddress2: district.streetAddress2 ?? null,
        city: district.city ?? null,
        state: district.state ?? null,
        zipCode: district.zipCode ?? null,
        phone: district.phone ?? null,
        email: district.email ?? null,
        fax: district.fax ?? null,
        website: district.website ?? null,
        districtEnrollment: district.districtEnrollment ?? null,
        raNumber: district.raNumber ?? null,
        numberOfSchools: district.numberOfSchools ?? null,
        numberOfStudents: district.numberOfStudents ?? null,
        annualBudget: district.annualBudget
          ? typeof district.annualBudget === "object" && "toNumber" in district.annualBudget
            ? district.annualBudget.toNumber()
            : Number(district.annualBudget)
          : null,
        superintendentName: district.superintendentName ?? null,
        establishedYear: district.establishedYear ?? null,
        statusId: district.statusId,
        cooperativeId: district.cooperativeId ?? null,
        code: district.code ?? null,
        createdAt: district.createdAt ?? new Date(),
        updatedAt: district.updatedAt ?? undefined,
        participatingIn: district.participatingIn ?? null,
        shippingAddress: district.shippingAddress ?? null,
        description: district.description ?? null,
        notes: district.notes ?? null,
        isDeleted: district.isDeleted ?? false,
        userStatus: district.userStatus
          ? new UserStatus({
              id: district.userStatus.id,
              name: district.userStatus.name,
            })
          : undefined,
        districtProducts: [],
        schools: [],
        bids: [],
        invitations: [],
        organizationContacts: [],
        scopes: [],
        users: [],
        vendorOrganizationApprovals: [],
      });
    });
  }

  async findLastDistrictCode(): Promise<string | null> {
    const district = await this.districtModel.findFirst({
      where: {
        isDeleted: false,
        code: {
          not: null,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        code: true,
      },
    });

    return district?.code ?? null;
  }

  async countByCooperativeId(cooperativeId: number): Promise<number> {
    return this.districtModel.count({
      where: {
        isDeleted: false,
        cooperativeId: cooperativeId,
      },
    });
  }

  async countByCooperativeIdSince(cooperativeId: number, date: Date): Promise<number> {
    return this.districtModel.count({
      where: {
        isDeleted: false,
        cooperativeId: cooperativeId,
        createdAt: {
          gte: date
        }
      }
    });
  }

  async createWithTransaction(prisma: PrismaClient, district: District): Promise<District> {
    try {
      const createdDistrict = await prisma.district.create({
        data: {
          name: district.name,
          location: district.location,
          directorName: district.directorName,
          streetAddress1: district.streetAddress1,
          streetAddress2: district.streetAddress2,
          city: district.city,
          state: district.state,
          zipCode: district.zipCode,
          phone: district.phone,
          email: district.email,
          fax: district.fax,
          website: district.website,
          districtEnrollment: district.districtEnrollment,
          raNumber: district.raNumber,
          numberOfSchools: district.numberOfSchools,
          numberOfStudents: district.numberOfStudents,
          annualBudget: district.annualBudget ? new Decimal(district.annualBudget) : null,
          superintendentName: district.superintendentName,
          establishedYear: district.establishedYear,
          statusId: district.statusId,
          cooperativeId: district.cooperativeId,
          code: district.code,
          participatingIn: district.participatingIn,
          shippingAddress: district.shippingAddress,
          description: district.description,
          notes: district.notes,
        },
        select: {
          id: true,
          name: true,
          location: true,
          directorName: true,
          streetAddress1: true,
          streetAddress2: true,
          city: true,
          state: true,
          zipCode: true,
          phone: true,
          email: true,
          fax: true,
          website: true,
          districtEnrollment: true,
          raNumber: true,
          numberOfSchools: true,
          numberOfStudents: true,
          annualBudget: true,
          superintendentName: true,
          establishedYear: true,
          statusId: true,
          cooperativeId: true,
          code: true,
          participatingIn: true,
          shippingAddress: true,
          description: true,
          notes: true,
          isDeleted: true,
        },
      });

      return new District({
        id: createdDistrict.id,
        name: createdDistrict.name,
        location: createdDistrict.location,
        directorName: createdDistrict.directorName,
        streetAddress1: createdDistrict.streetAddress1,
        streetAddress2: createdDistrict.streetAddress2,
        city: createdDistrict.city,
        state: createdDistrict.state,
        zipCode: createdDistrict.zipCode,
        phone: createdDistrict.phone,
        email: createdDistrict.email,
        fax: createdDistrict.fax,
        website: createdDistrict.website,
        districtEnrollment: createdDistrict.districtEnrollment,
        raNumber: createdDistrict.raNumber,
        numberOfSchools: createdDistrict.numberOfSchools,
        numberOfStudents: createdDistrict.numberOfStudents,
        annualBudget: createdDistrict.annualBudget
          ? typeof createdDistrict.annualBudget === "object" &&
            "toNumber" in createdDistrict.annualBudget
            ? createdDistrict.annualBudget.toNumber()
            : Number(createdDistrict.annualBudget)
          : undefined,
        superintendentName: createdDistrict.superintendentName,
        establishedYear: createdDistrict.establishedYear,
        statusId: createdDistrict.statusId,
        cooperativeId: createdDistrict.cooperativeId || null,
        code: createdDistrict.code || null,
        updatedAt: new Date(),
        participatingIn: createdDistrict.participatingIn || null,
        shippingAddress: createdDistrict.shippingAddress || null,
        description: createdDistrict.description || null,
        notes: createdDistrict.notes || null,
        isDeleted: createdDistrict.isDeleted,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("Unique constraint")) {
        throw new Error("A district with this code already exists");
      }
      throw error;
    }
  }
}

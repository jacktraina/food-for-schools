import { inject, injectable } from "inversify";
import { IDatabaseService } from "../../application/contracts/IDatabaseService";
import TYPES from "../../shared/dependencyInjection/types";
import { PrismaClient } from "@prisma/client";
import { IVendorRepository } from "../../domain/interfaces/vendors/IVendorRepository";
import { Vendor } from "../../domain/interfaces/vendors/Vendor";
import { VendorStatusesEnum } from "../../domain/constants/VendorStatusesEnum";
import { OrganizationUtils } from "../utls/OrganizationUtils";

@injectable()
export class VendorRepository implements IVendorRepository {
  private vendorModel: PrismaClient["vendor"];
  private vendorOrganizationApprovalModel: PrismaClient["vendorOrganizationApproval"];

  constructor(@inject(TYPES.IDatabaseService) database: IDatabaseService) {
    this.vendorModel = database.getClient().vendor;
    this.vendorOrganizationApprovalModel =
      database.getClient().vendorOrganizationApproval;
  }

  async countActive(): Promise<number> {
    const count = await this.vendorModel.count({
      where: {
        statusId: VendorStatusesEnum.ACTIVE,
        isDeleted: false,
      },
    });
    return count;
  }

  async countPendingApprovals(): Promise<number> {
    const count = await this.vendorOrganizationApprovalModel.count({
      where: {
        statusId: VendorStatusesEnum.PENDING,
      },
    });
    return count;
  }

  async countActiveSince(date: Date): Promise<number> {
    return this.vendorModel.count({
      where: {
        statusId: VendorStatusesEnum.ACTIVE,
        isDeleted: false,
        registeredAt: {
          gte: date,
        },
      },
    });
  }

  async countPendingApprovalsSince(date: Date): Promise<number> {
    return this.vendorOrganizationApprovalModel.count({
      where: {
        statusId: VendorStatusesEnum.PENDING,
        createdAt: {
          gte: date,
        },
      },
    });
  }

  async countActiveByOrganization(params: {
    cooperativeId?: number;
    districtId?: number;
  }): Promise<number> {
    const where = OrganizationUtils.BuildOrganizationWhereClause({
      ...params,
      statusId: VendorStatusesEnum.ACTIVE,
      isDeleted: false,
    });

    return this.vendorModel.count({ where });
  }

  async countActiveSinceByOrganization(
    date: Date,
    params: { cooperativeId?: number; districtId?: number }
  ): Promise<number> {
    const where = OrganizationUtils.BuildOrganizationWhereClause({
      ...params,
      statusId: VendorStatusesEnum.ACTIVE,
      isDeleted: false,
      dateField: "registeredAt",
      date,
    });

    return this.vendorModel.count({ where });
  }

  async countPendingApprovalsByOrganization(params: {
    cooperativeId?: number;
    districtId?: number;
  }): Promise<number> {
    const where = OrganizationUtils.BuildOrganizationWhereClause({
      ...params,
      statusId: VendorStatusesEnum.PENDING,
    });

    return this.vendorOrganizationApprovalModel.count({ where });
  }

  async countPendingApprovalsSinceByOrganization(
    date: Date,
    params: { cooperativeId?: number; districtId?: number }
  ): Promise<number> {
    const where = OrganizationUtils.BuildOrganizationWhereClause({
      ...params,
      statusId: VendorStatusesEnum.PENDING,
      dateField: "createdAt",
      date,
    });

    return this.vendorOrganizationApprovalModel.count({ where });
  }

  async create(vendor: Vendor): Promise<Vendor> {
    const createdVendor = await this.vendorModel.create({
      data: {
        email: vendor.email,
        name: vendor.name,
        statusId: vendor.statusId,
        cooperativeId: vendor.cooperativeId,
        districtId: vendor.districtId,
        registeredAt: vendor.registeredAt,
        isDeleted: vendor.isDeleted,
      },
    });

    return new Vendor({
      id: createdVendor.id,
      email: createdVendor.email,
      name: createdVendor.name,
      statusId: createdVendor.statusId,
      cooperativeId: createdVendor.cooperativeId,
      districtId: createdVendor.districtId,
      registeredAt: createdVendor.registeredAt,
      isDeleted: createdVendor.isDeleted,
      vendorStatus: { id: createdVendor.statusId, name: "Active" },
    });
  }

  async findByEmail(email: string): Promise<Vendor | null> {
    const vendor = await this.vendorModel.findUnique({
      where: { email: email.toLowerCase() },
      include: { vendorStatus: true },
    });

    if (!vendor) return null;

    return new Vendor({
      id: vendor.id,
      email: vendor.email,
      name: vendor.name,
      statusId: vendor.statusId,
      cooperativeId: vendor.cooperativeId,
      districtId: vendor.districtId,
      registeredAt: vendor.registeredAt,
      isDeleted: vendor.isDeleted,
      vendorStatus: vendor.vendorStatus,
    });
  }
}

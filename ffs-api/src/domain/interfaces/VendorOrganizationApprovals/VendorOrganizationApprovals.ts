import { Cooperative } from "../Cooperatives/Cooperative";
import { District } from "../Districts/District";
import { Vendor } from "../vendors/Vendor";
import { VendorStatus } from "../vendorStatuses/VendorStatus";
import { StatusEnum } from "../../constants/StatusEnum";

export interface IVendorOrganizationApprovalProps {
  id: number;
  vendorId: number;
  statusId: number;
  cooperativeId?: number | null;
  districtId?: number | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  vendor: Vendor;
  vendorStatus: VendorStatus;
  cooperative?: Cooperative | null;
  district?: District | null;
}

export class VendorOrganizationApproval {
  id: number;
  vendorId: number;
  statusId: number;
  cooperativeId?: number | null;
  districtId?: number | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  vendor: Vendor;
  vendorStatus: VendorStatus;
  cooperative?: Cooperative | null;
  district?: District | null;

  constructor({
    id,
    vendorId,
    statusId,
    cooperativeId = null,
    districtId = null,
    createdAt = null,
    updatedAt = null,
    vendor,
    vendorStatus,
    cooperative = null,
    district = null,
  }: IVendorOrganizationApprovalProps) {
    this.id = id;
    this.vendorId = vendorId;
    this.statusId = statusId;
    this.cooperativeId = cooperativeId;
    this.districtId = districtId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.vendor = vendor;
    this.vendorStatus = vendorStatus;
    this.cooperative = cooperative;
    this.district = district;
  }

  isActive(): boolean {
    return this.statusId === StatusEnum.ACTIVE;
  }
}

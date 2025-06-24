import { VendorOrganizationApproval } from "../VendorOrganizationApprovals/VendorOrganizationApprovals";
import { VendorStatus } from "../vendorStatuses/VendorStatus";
import { StatusEnum } from "../../constants/StatusEnum";

export interface IVendorProps {
  id: number;
  email: string;
  name: string;
  cooperativeId?: number | null;
  districtId?: number | null;
  statusId: number;
  registeredAt?: Date | null;
  isDeleted: boolean;
  vendorStatus: VendorStatus;
  vendorOrganizationApprovals?: VendorOrganizationApproval[];
}

export class Vendor {
  id: number;
  email: string;
  name: string;
  cooperativeId?: number | null;
  districtId?: number | null;
  statusId: number;
  registeredAt?: Date | null;
  isDeleted: boolean;
  vendorStatus: VendorStatus;
  vendorOrganizationApprovals: VendorOrganizationApproval[];

  constructor({
    id,
    email,
    name,
    cooperativeId = null,
    districtId = null,
    statusId = StatusEnum.ACTIVE,
    registeredAt = null,
    isDeleted = false,
    vendorStatus,
    vendorOrganizationApprovals = [],
  }: IVendorProps) {
    this.id = id;
    this.email = email;
    this.name = name;
    this.cooperativeId = cooperativeId;
    this.districtId = districtId;
    this.statusId = statusId;
    this.registeredAt = registeredAt;
    this.isDeleted = isDeleted;
    this.vendorStatus = vendorStatus;
    this.vendorOrganizationApprovals = vendorOrganizationApprovals;
  }

  isActive(): boolean {
    return this.statusId === StatusEnum.ACTIVE && !this.isDeleted;
  }

  static create(data: {
    email: string;
    name: string;
    statusId: number;
    cooperativeId?: number | null;
    districtId?: number | null;
  }): Vendor {
    return new Vendor({
      id: 0,
      email: data.email,
      name: data.name,
      statusId: data.statusId,
      cooperativeId: data.cooperativeId || null,
      districtId: data.districtId || null,
      registeredAt: new Date(),
      isDeleted: false,
      vendorStatus: { id: data.statusId, name: 'Active' }
    });
  }
}

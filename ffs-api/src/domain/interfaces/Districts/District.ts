import { DistrictProduct } from "../DistrictProducts/DistrictProduct";
import { School } from "../Schools/School";
import { UserStatus } from "../userStatuses/UserStatus";
import { Bid } from "../Bids/Bid";
import { Invitation } from "../invitations/Invitation";
import { Scope } from "../scopes/Scope";
import { User } from "../users/User";
import { VendorOrganizationApproval } from "../VendorOrganizationApprovals/VendorOrganizationApprovals";
import { OrganizationContact } from "../OrganizationContacts/OrganizationContact";
import { Cooperative } from "../Cooperatives/Cooperative";
import { CreateDistrictRequest } from "../../../interfaces/requests/district/CreateDistrictRequest";
import { UpdateDistrictRequestData } from "../../../interfaces/requests/district/UpdateDistrictRequest";
import { StatusEnum } from "../../constants/StatusEnum";

export interface IDistrictProps {
  id?: number;
  name: string;
  location?: string | null;
  directorName?: string | null;
  streetAddress1?: string | null;
  streetAddress2?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  phone?: string | null;
  email?: string | null;
  fax?: string | null;
  website?: string | null;
  districtEnrollment?: number | null;
  raNumber?: string | null;
  numberOfSchools?: number | null;
  numberOfStudents?: number | null;
  annualBudget?: number | null;
  superintendentName?: string | null;
  establishedYear?: number | null;
  statusId: number;
  cooperativeId?: number | null;
  code?: string | null;
  updatedAt?: Date;
  participatingIn?: string | null;
  shippingAddress?: string | null;
  description?: string | null;
  notes?: string | null;
  createdAt?: Date | null;
  isDeleted?: boolean;
  districtProducts?: DistrictProduct[];
  userStatus?: UserStatus;
  cooperative?: Cooperative;
  schools?: School[];
  bids?: Bid[];
  invitations?: Invitation[];
  organizationContacts?: OrganizationContact[];
  scopes?: Scope[];
  users?: User[];
  vendorOrganizationApprovals?: VendorOrganizationApproval[];
}

export class District {
  id?: number;
  name: string;
  location?: string | null;
  directorName?: string | null;
  streetAddress1?: string | null;
  streetAddress2?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  phone?: string | null;
  email?: string | null;
  fax?: string | null;
  website?: string | null;
  districtEnrollment?: number | null;
  raNumber?: string | null;
  numberOfSchools?: number | null;
  numberOfStudents?: number | null;
  annualBudget?: number | null;
  superintendentName?: string | null;
  establishedYear?: number | null;
  statusId: number;
  cooperativeId?: number | null;
  code?: string | null;
  updatedAt?: Date;
  participatingIn?: string | null;
  shippingAddress?: string | null;
  description?: string | null;
  notes?: string | null;
  createdAt: Date | null;
  isDeleted: boolean;
  districtProducts?: DistrictProduct[];
  userStatus?: UserStatus;
  cooperative?: Cooperative;
  schools?: School[];
  bids?: Bid[];
  invitations?: Invitation[];
  organizationContacts?: OrganizationContact[];
  scopes?: Scope[];
  users?: User[];
  vendorOrganizationApprovals?: VendorOrganizationApproval[];

  constructor({
    id,
    name,
    location,
    directorName,
    streetAddress1,
    streetAddress2,
    city,
    state,
    zipCode,
    phone,
    email,
    fax,
    website,
    districtEnrollment,
    raNumber,
    numberOfSchools,
    numberOfStudents,
    annualBudget,
    superintendentName,
    establishedYear,
    statusId,
    cooperativeId,
    code,
    createdAt,
    updatedAt,
    participatingIn,
    shippingAddress,
    description,
    notes,
    isDeleted = false,
    districtProducts = [],
    userStatus,
    cooperative,
    schools = [],
    bids = [],
    invitations = [],
    organizationContacts = [],
    scopes = [],
    users = [],
    vendorOrganizationApprovals = [],
  }: IDistrictProps) {
    this.id = id;
    this.name = name;
    this.location = location;
    this.directorName = directorName;
    this.streetAddress1 = streetAddress1;
    this.streetAddress2 = streetAddress2;
    this.city = city;
    this.state = state;
    this.zipCode = zipCode;
    this.phone = phone;
    this.email = email;
    this.fax = fax;
    this.website = website;
    this.districtEnrollment = districtEnrollment;
    this.raNumber = raNumber;
    this.numberOfSchools = numberOfSchools;
    this.numberOfStudents = numberOfStudents;
    this.annualBudget = annualBudget;
    this.superintendentName = superintendentName;
    this.establishedYear = establishedYear;
    this.statusId = statusId;
    this.cooperativeId = cooperativeId;
    this.code = code;
    this.createdAt = createdAt ?? new Date();
    this.updatedAt = updatedAt;
    this.participatingIn = participatingIn;
    this.shippingAddress = shippingAddress;
    this.description = description;
    this.notes = notes;
    this.isDeleted = isDeleted;
    this.districtProducts = districtProducts;
    this.userStatus = userStatus;
    this.cooperative = cooperative;
    this.schools = schools;
    this.bids = bids;
    this.invitations = invitations;
    this.organizationContacts = organizationContacts;
    this.scopes = scopes;
    this.users = users;
    this.vendorOrganizationApprovals = vendorOrganizationApprovals;

    // Validate required fields
    District.validateName(name);
    District.validateStatusId(statusId);
  }

  static validateName(name: string): void {
    if (!name || name.trim() === "") {
      throw new Error("name is required and cannot be empty");
    }
  }

  static validateStatusId(statusId: number): void {
    if (!Number.isInteger(statusId) || statusId <= 0) {
      throw new Error("statusId must be a positive integer");
    }
  }

  isActive(): boolean {
    return this.statusId === StatusEnum.ACTIVE;
  }

  markAsActive(): void {
    this.statusId = StatusEnum.ACTIVE;
    this.updatedAt = new Date();
  }

  markAsInactive(): void {
    this.statusId = StatusEnum.INACTIVE;
    this.updatedAt = new Date();
  }

  markAsDeleted(): void {
    this.isDeleted = true;
    this.updatedAt = new Date();
  }

  getDisplayName(): string {
    return this.name;
  }

  update(props: Partial<IDistrictProps>): District {
    return new District({
      ...this.toJSON(),
      ...props,
      updatedAt: new Date(),
    });
  }

  toJSON(): IDistrictProps {
    return {
      id: this.id,
      name: this.name,
      location: this.location ?? undefined,
      directorName: this.directorName ?? undefined,
      streetAddress1: this.streetAddress1 ?? undefined,
      streetAddress2: this.streetAddress2 ?? undefined,
      city: this.city ?? undefined,
      state: this.state ?? undefined,
      zipCode: this.zipCode ?? undefined,
      phone: this.phone ?? undefined,
      email: this.email ?? undefined,
      fax: this.fax ?? undefined,
      website: this.website ?? undefined,
      districtEnrollment: this.districtEnrollment ?? undefined,
      raNumber: this.raNumber ?? undefined,
      numberOfSchools: this.numberOfSchools ?? undefined,
      numberOfStudents: this.numberOfStudents ?? undefined,
      annualBudget: this.annualBudget ?? undefined,
      superintendentName: this.superintendentName ?? undefined,
      establishedYear: this.establishedYear ?? undefined,
      statusId: this.statusId,
      cooperativeId: this.cooperativeId ?? undefined,
      code: this.code ?? undefined,
      updatedAt: this.updatedAt,
      participatingIn: this.participatingIn ?? undefined,
      shippingAddress: this.shippingAddress ?? undefined,
      description: this.description ?? undefined,
      notes: this.notes ?? undefined,
      createdAt: this.createdAt,
      isDeleted: this.isDeleted,
      districtProducts: this.districtProducts,
      userStatus: this.userStatus,
      cooperative: this.cooperative,
      schools: this.schools,
      bids: this.bids,
      invitations: this.invitations,
      organizationContacts: this.organizationContacts,
      scopes: this.scopes,
      users: this.users,
      vendorOrganizationApprovals: this.vendorOrganizationApprovals,
    };
  }

  static mapUpdateRequestToProps(updateData: UpdateDistrictRequestData): Partial<IDistrictProps> {
    const props: Partial<IDistrictProps> = {};
    
    if (updateData.name !== undefined) props.name = updateData.name || undefined;
    if (updateData.location !== undefined) props.location = updateData.location || undefined;
    if (updateData.directorName !== undefined) props.directorName = updateData.directorName || undefined;
    if (updateData.streetAddress1 !== undefined) props.streetAddress1 = updateData.streetAddress1 || undefined;
    if (updateData.streetAddress2 !== undefined) props.streetAddress2 = updateData.streetAddress2 || undefined;
    if (updateData.city !== undefined) props.city = updateData.city || undefined;
    if (updateData.state !== undefined) props.state = updateData.state || undefined;
    if (updateData.zipCode !== undefined) props.zipCode = updateData.zipCode || undefined;
    if (updateData.phone !== undefined) props.phone = updateData.phone || undefined;
    if (updateData.email !== undefined) props.email = updateData.email || undefined;
    if (updateData.fax !== undefined) props.fax = updateData.fax || undefined;
    if (updateData.website !== undefined) props.website = updateData.website || undefined;
    if (updateData.districtEnrollment !== undefined) props.districtEnrollment = updateData.districtEnrollment || undefined;
    if (updateData.raNumber !== undefined) props.raNumber = updateData.raNumber || undefined;
    if (updateData.numberOfSchools !== undefined) props.numberOfSchools = updateData.numberOfSchools || undefined;
    if (updateData.numberOfStudents !== undefined) props.numberOfStudents = updateData.numberOfStudents || undefined;
    if (updateData.annualBudget !== undefined) props.annualBudget = updateData.annualBudget ? Number(updateData.annualBudget) : undefined;
    if (updateData.superintendentName !== undefined) props.superintendentName = updateData.superintendentName || undefined;
    if (updateData.establishedYear !== undefined) props.establishedYear = updateData.establishedYear || undefined;
    if (updateData.isDelete !== undefined) props.isDeleted = updateData.isDelete || undefined;
    
    return props;
  }

  static create(districtData: CreateDistrictRequest, statusId: number, 
    organizationId: number, code?: string | null): District {
    const district = new District({
      name: districtData.name,
      location: districtData.location ?? null,
      directorName: districtData.directorName ?? null,
      streetAddress1: districtData.addressLine1 ?? null,
      streetAddress2: districtData.addressLine2 ?? null,
      city: districtData.city ?? null,
      state: districtData.state ?? null,
      zipCode: districtData.zipCode ?? null,
      phone: districtData.phone ?? null,
      email: districtData.email ?? null,
      fax: districtData.fax ?? null,
      website: districtData.website ?? null,
      statusId: statusId,
      cooperativeId: organizationId,
      code: code,
      participatingIn: districtData.participatingIn ? JSON.stringify(districtData.participatingIn) : null,
      shippingAddress: null,
      description: null,
      notes: null,
      districtEnrollment: districtData.enrollment ?? null,
      raNumber: districtData.raNumber ?? null,
      numberOfSchools: districtData.schools ?? null,
      numberOfStudents: districtData.students ?? null,
      annualBudget: districtData.budget ? Number(districtData.budget) : null,
      superintendentName: districtData.superintendent ?? null,
      establishedYear: districtData.established ? Number(districtData.established) : null,
    });

    return district;
  }
}

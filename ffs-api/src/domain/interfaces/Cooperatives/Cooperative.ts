import { OrganizationType } from "../organizationTypes/OrganizationType";
import { UserStatus } from "../userStatuses/UserStatus";
import { UpdateOrganizationData } from "../../../application/contracts/IOrganizationService";

export interface ICooperativeProps {
  id: number;
  code: string;
  name: string;
  organizationTypeId: number;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  phone?: string | null;
  fax?: string | null;
  email?: string | null;
  website?: string | null;
  logo?: string | null;
  description?: string | null;
  enrollment?: number | null;
  location?: string | null;
  directorsName?: string | null;
  raNumber?: string | null;
  superintendent?: string | null;
  established?: number | null;
  userStatusId: number;
  budget?: number | null;
  lastUpdated?: Date | null;
  participatingIn?: string | null;
  shippingAddress?: string | null;
  notes?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  organizationType?: OrganizationType;
  userStatus?: UserStatus;
}

export class Cooperative {
  id: number;
  code: string;
  name: string;
  organizationTypeId: number;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  phone?: string | null;
  fax?: string | null;
  email?: string | null;
  website?: string | null;
  logo?: string | null;
  description?: string | null;
  enrollment?: number | null;
  location?: string | null;
  directorsName?: string | null;
  raNumber?: string | null;
  superintendent?: string | null;
  established?: number | null;
  userStatusId: number;
  budget?: number | null;
  lastUpdated?: Date | null;
  participatingIn?: string | null;
  shippingAddress?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt?: Date;
  organizationType?: OrganizationType;
  userStatus?: UserStatus;

  constructor(props: ICooperativeProps) {
    this.id = props.id;
    this.code = props.code;
    this.name = props.name;
    this.organizationTypeId = props.organizationTypeId;
    this.address = props.address;
    this.city = props.city;
    this.state = props.state;
    this.zip = props.zip;
    this.phone = props.phone;
    this.fax = props.fax;
    this.email = props.email;
    this.website = props.website;
    this.logo = props.logo;
    this.description = props.description;
    this.enrollment = props.enrollment;
    this.location = props.location;
    this.directorsName = props.directorsName;
    this.raNumber = props.raNumber;
    this.superintendent = props.superintendent;
    this.established = props.established;
    this.userStatusId = props.userStatusId;
    this.budget = props.budget;
    this.lastUpdated = props.lastUpdated;
    this.participatingIn = props.participatingIn;
    this.shippingAddress = props.shippingAddress;
    this.notes = props.notes;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt;
    this.organizationType = props.organizationType;
    this.userStatus = props.userStatus;

    Cooperative.validateCode(this.code);
    Cooperative.validateName(this.name);
  }

  static validateCode(code: string): void {
    if (!code || code.trim() === '') {
      throw new Error('code is required and cannot be empty');
    }
    if (code.length > 50) {
      throw new Error('code must not exceed 50 characters');
    }
  }

  static validateName(name: string): void {
    if (!name || name.trim() === '') {
      throw new Error('name is required and cannot be empty');
    }
  }

  update(props: Partial<ICooperativeProps>): Cooperative {
    return new Cooperative({
      ...this.toJSON(),
      ...props,
      updatedAt: new Date(),
    });
  }

  toJSON(): ICooperativeProps {
    return {
      id: this.id,
      code: this.code,
      name: this.name,
      organizationTypeId: this.organizationTypeId,
      address: this.address,
      city: this.city,
      state: this.state,
      zip: this.zip,
      phone: this.phone,
      fax: this.fax,
      email: this.email,
      website: this.website,
      logo: this.logo,
      description: this.description,
      enrollment: this.enrollment,
      location: this.location,
      directorsName: this.directorsName,
      raNumber: this.raNumber,
      superintendent: this.superintendent,
      established: this.established,
      userStatusId: this.userStatusId,
      budget: this.budget,
      lastUpdated: this.lastUpdated,
      participatingIn: this.participatingIn,
      shippingAddress: this.shippingAddress,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      organizationType: this.organizationType,
      userStatus: this.userStatus,
    };
  }

  static mapUpdateRequestToProps(updateData: UpdateOrganizationData): Partial<ICooperativeProps> {
    const props: Partial<ICooperativeProps> = {};
    
    if (updateData.streetAddress1 !== undefined) props.address = updateData.streetAddress1 || undefined;
    if (updateData.city !== undefined) props.city = updateData.city || undefined;
    if (updateData.state !== undefined) props.state = updateData.state || undefined;
    if (updateData.zipCode !== undefined) props.zip = updateData.zipCode || undefined;
    if (updateData.phone !== undefined) props.phone = updateData.phone || undefined;
    if (updateData.email !== undefined) props.email = updateData.email || undefined;
    
    return props;
  }
}

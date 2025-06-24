import { StatusEnum } from '../../constants/StatusEnum';
import { District } from '../Districts/District';
import { UserStatus } from '../userStatuses/UserStatus';
import { CreateSchoolRequest } from '../../../interfaces/requests/schools/CreateSchoolRequest';

export interface ISchoolProps {
  id?: number;
  districtId: number;
  name: string;
  enrollment?: number | null;
  schoolType: string;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  shippingAddressLine1?: string | null;
  shippingAddressLine2?: string | null;
  shippingAddressCity?: string | null;
  shippingAddressState?: string | null;
  shippingAddressZipCode?: string | null;
  notes?: string | null;
  phone?: string | null;
  email?: string | null;
  overrideDistrictBilling?: boolean;
  statusId?: number; // Using UserStatus ID directly
  isDeleted?: boolean;
  createdAt?: Date;
  code?: string | null;
  location?: string | null;
  directorName?: string | null;
  raNumber?: string | null;
  superintendent?: string | null;
  established?: number | null;
  budget?: number | null;
  participatingIn?: string | null;
  website?: string | null;
  description?: string | null;
  logo?: string | null;
  fax?: string | null;
  shippingInstructions?: string | null;
  shippingDeliveryHours?: string | null;
  updatedAt?: Date;
  districts?: District;
  userStatuses?: UserStatus;
}

export class School {
  readonly id?: number;
  readonly districtId: number;
  readonly name: string;
  readonly enrollment: number | null;
  readonly schoolType: string;
  readonly addressLine1: string | null;
  readonly addressLine2: string | null;
  readonly city: string | null;
  readonly state: string | null;
  readonly zipCode: string | null;
  readonly shippingAddressLine1: string | null;
  readonly shippingAddressLine2: string | null;
  readonly shippingAddressCity: string | null;
  readonly shippingAddressState: string | null;
  readonly shippingAddressZipCode: string | null;
  readonly notes: string | null;
  readonly phone: string | null;
  readonly email: string | null;
  readonly overrideDistrictBilling: boolean;
  statusId: number;
  readonly isDeleted: boolean;
  readonly createdAt: Date;
  readonly code: string | null;
  readonly location: string | null;
  readonly directorName: string | null;
  readonly raNumber: string | null;
  readonly superintendent: string | null;
  readonly established: number | null;
  readonly budget: number | null;
  readonly participatingIn: string | null;
  readonly website: string | null;
  readonly description: string | null;
  readonly logo: string | null;
  readonly fax: string | null;
  readonly shippingInstructions?: string | null;
  readonly shippingDeliveryHours?: string | null;
  updatedAt: Date;
  readonly districts?: District;
  readonly userStatuses?: UserStatus;

  constructor(props: ISchoolProps) {
    this.id = props.id;
    this.districtId = props.districtId;
    this.name = props.name;
    this.enrollment = props.enrollment ?? null;
    this.schoolType = props.schoolType;
    this.addressLine1 = props.addressLine1 ?? null;
    this.addressLine2 = props.addressLine2 ?? null;
    this.city = props.city ?? null;
    this.state = props.state ?? null;
    this.zipCode = props.zipCode ?? null;
    this.shippingAddressLine1 = props.shippingAddressLine1 ?? null;
    this.shippingAddressLine2 = props.shippingAddressLine2 ?? null;
    this.shippingAddressCity = props.shippingAddressCity ?? null;
    this.shippingAddressState = props.shippingAddressState ?? null;
    this.shippingAddressZipCode = props.shippingAddressZipCode ?? null;
    this.notes = props.notes ?? null;
    this.phone = props.phone ?? null;
    this.email = props.email ?? null;
    this.overrideDistrictBilling = props.overrideDistrictBilling ?? false;
    this.statusId = props.statusId ?? StatusEnum.ACTIVE;
    this.isDeleted = props.isDeleted ?? false;
    this.createdAt = props.createdAt ?? new Date();
    this.code = props.code ?? null;
    this.location = props.location ?? null;
    this.directorName = props.directorName ?? null;
    this.raNumber = props.raNumber ?? null;
    this.superintendent = props.superintendent ?? null;
    this.established = props.established ?? null;
    this.budget = props.budget ?? null;
    this.participatingIn = props.participatingIn ?? null;
    this.website = props.website ?? null;
    this.description = props.description ?? null;
    this.logo = props.logo ?? null;
    this.fax = props.fax ?? null;
    this.shippingInstructions = props.shippingInstructions ?? null;
    this.shippingDeliveryHours = props.shippingDeliveryHours ?? null;
    this.updatedAt = props.updatedAt ?? new Date();
    this.districts = props.districts;
    this.userStatuses = props.userStatuses;

    this.validate();
  }

  private validate(): void {
    if (!this.name || this.name.trim() === '') {
      throw new Error('School name is required and cannot be empty');
    }
    if (this.name.length > 255) {
      throw new Error('School name cannot exceed 255 characters');
    }
    if (!this.districtId || this.districtId <= 0) {
      throw new Error('District ID is required and must be a positive number');
    }
    if (!this.schoolType || this.schoolType.trim() === '') {
      throw new Error('School type is required and cannot be empty');
    }
  }

  get fullAddress(): string {
    return [this.addressLine1, this.addressLine2, this.city, this.state, this.zipCode]
      .filter((part) => part && part.trim() !== '')
      .join(', ');
  }

  get shippingFullAddress(): string {
    return [
      this.shippingAddressLine1,
      this.shippingAddressLine2,
      this.shippingAddressCity,
      this.shippingAddressState,
      this.shippingAddressZipCode,
    ]
      .filter((part) => part && part.trim() !== '')
      .join(', ');
  }

  get isActive(): boolean {
    return this.statusId === StatusEnum.ACTIVE;
  }

  get isPending(): boolean {
    return this.statusId === StatusEnum.PENDING;
  }

  get isInactive(): boolean {
    return this.statusId === StatusEnum.INACTIVE;
  }

  get statusName(): string | null {
    return this.userStatuses?.name ?? null;
  }

  update(props: Partial<ISchoolProps>): School {
    return new School({
      ...this.toJSON(),
      ...props,
      updatedAt: new Date(),
    });
  }

  markAsInactive(): void {
    this.statusId = StatusEnum.INACTIVE;
    this.updatedAt = new Date();
  }

  markAsActive(): void {
    this.statusId = StatusEnum.ACTIVE;
    this.updatedAt = new Date();
  }

  toJSON(): ISchoolProps {
    return {
      id: this.id,
      districtId: this.districtId,
      name: this.name,
      enrollment: this.enrollment ?? undefined,
      schoolType: this.schoolType,
      addressLine1: this.addressLine1 ?? undefined,
      addressLine2: this.addressLine2 ?? undefined,
      city: this.city ?? undefined,
      state: this.state ?? undefined,
      zipCode: this.zipCode ?? undefined,
      shippingAddressLine1: this.shippingAddressLine1 ?? undefined,
      shippingAddressLine2: this.shippingAddressLine2 ?? undefined,
      shippingAddressCity: this.shippingAddressCity ?? undefined,
      shippingAddressState: this.shippingAddressState ?? undefined,
      shippingAddressZipCode: this.shippingAddressZipCode ?? undefined,
      notes: this.notes ?? undefined,
      phone: this.phone ?? undefined,
      email: this.email ?? undefined,
      overrideDistrictBilling: this.overrideDistrictBilling,
      statusId: this.statusId,
      isDeleted: this.isDeleted,
      createdAt: this.createdAt,
      code: this.code ?? undefined,
      location: this.location ?? undefined,
      directorName: this.directorName ?? undefined,
      raNumber: this.raNumber ?? undefined,
      superintendent: this.superintendent ?? undefined,
      established: this.established ?? undefined,
      budget: this.budget ?? undefined,
      participatingIn: this.participatingIn ?? undefined,
      website: this.website ?? undefined,
      description: this.description ?? undefined,
      logo: this.logo ?? undefined,
      fax: this.fax ?? undefined,
      shippingInstructions: this.shippingInstructions ?? undefined,
      shippingDeliveryHours: this.shippingDeliveryHours ?? undefined,
      updatedAt: this.updatedAt,
    };
  }

  static create(schoolData: CreateSchoolRequest, districtId: number, statusId: number): School {
    return new School({
      districtId,
      name: schoolData.name,
      enrollment: schoolData.enrollment,
      schoolType: schoolData.schoolType,
      addressLine1: schoolData.addressLine1,
      addressLine2: schoolData.addressLine2,
      city: schoolData.city,
      state: schoolData.state,
      zipCode: schoolData.zipCode,
      shippingAddressLine1: schoolData.shippingAddressLine1,
      shippingAddressLine2: schoolData.shippingAddressLine2,
      shippingAddressCity: schoolData.shippingAddressCity,
      shippingAddressState: schoolData.shippingAddressState,
      shippingAddressZipCode: schoolData.shippingAddressZipCode,
      phone: schoolData.phone,
      fax: schoolData.fax,
      email: schoolData.email,
      website: schoolData.website,
      notes: schoolData.notes,
      overrideDistrictBilling: schoolData.overrideDistrictBilling,
      statusId,
    });
  }

  static fromPrismaModel(prismaSchool: {
    id: number;
    districtId: number;
    name: string;
    enrollment?: number | null;
    schoolType: string;
    addressLine1?: string | null;
    addressLine2?: string | null;
    city?: string | null;
    state?: string | null;
    zipCode?: string | null;
    shippingAddressLine1?: string | null;
    shippingAddressLine2?: string | null;
    shippingAddressCity?: string | null;
    shippingAddressState?: string | null;
    shippingAddressZipCode?: string | null;
    notes?: string | null;
    phone?: string | null;
    email?: string | null;
    overrideDistrictBilling?: boolean;
    statusId?: number;
    isDeleted?: boolean;
    createdAt?: Date;
    code?: string | null;
    location?: string | null;
    directorName?: string | null;
    raNumber?: string | null;
    superintendent?: string | null;
    established?: number | null;
    budget?: number | null;
    participatingIn?: string | null;
    website?: string | null;
    description?: string | null;
    logo?: string | null;
    fax?: string | null;
    shippingInstructions?: string | null;
    shippingDeliveryHours?: string | null;
    updatedAt?: Date;
  }): School {
    return new School({
      id: prismaSchool.id,
      districtId: prismaSchool.districtId,
      name: prismaSchool.name,
      enrollment: prismaSchool.enrollment,
      schoolType: prismaSchool.schoolType,
      addressLine1: prismaSchool.addressLine1,
      addressLine2: prismaSchool.addressLine2,
      city: prismaSchool.city,
      state: prismaSchool.state,
      zipCode: prismaSchool.zipCode,
      shippingAddressLine1: prismaSchool.shippingAddressLine1,
      shippingAddressLine2: prismaSchool.shippingAddressLine2,
      shippingAddressCity: prismaSchool.shippingAddressCity,
      shippingAddressState: prismaSchool.shippingAddressState,
      shippingAddressZipCode: prismaSchool.shippingAddressZipCode,
      notes: prismaSchool.notes,
      phone: prismaSchool.phone,
      email: prismaSchool.email,
      overrideDistrictBilling: prismaSchool.overrideDistrictBilling,
      statusId: prismaSchool.statusId,
      isDeleted: prismaSchool.isDeleted,
      createdAt: prismaSchool.createdAt,
      code: prismaSchool.code,
      location: prismaSchool.location,
      directorName: prismaSchool.directorName,
      raNumber: prismaSchool.raNumber,
      superintendent: prismaSchool.superintendent,
      established: prismaSchool.established,
      budget: prismaSchool.budget,
      participatingIn: prismaSchool.participatingIn,
      website: prismaSchool.website,
      description: prismaSchool.description,
      logo: prismaSchool.logo,
      fax: prismaSchool.fax,
      shippingInstructions: prismaSchool.shippingInstructions,
      shippingDeliveryHours: prismaSchool.shippingDeliveryHours,
      updatedAt: prismaSchool.updatedAt,
    });
  }

  static mapUpdateRequestToProps(updateData: Record<string, unknown>): Partial<ISchoolProps> {
    const props: Partial<ISchoolProps> = {};

    if (updateData.name !== undefined) props.name = (updateData.name as string) || undefined;
    if (updateData.enrollment !== undefined)
      props.enrollment = (updateData.enrollment as number) || undefined;
    if (updateData.schoolType !== undefined)
      props.schoolType = (updateData.schoolType as string) || undefined;
    if (updateData.addressLine1 !== undefined)
      props.addressLine1 = (updateData.addressLine1 as string) || undefined;
    if (updateData.addressLine2 !== undefined)
      props.addressLine2 = (updateData.addressLine2 as string) || undefined;
    if (updateData.city !== undefined) props.city = (updateData.city as string) || undefined;
    if (updateData.state !== undefined) props.state = (updateData.state as string) || undefined;
    if (updateData.zipCode !== undefined)
      props.zipCode = (updateData.zipCode as string) || undefined;
    if (updateData.shippingAddressLine1 !== undefined)
      props.shippingAddressLine1 = (updateData.shippingAddressLine1 as string) || undefined;
    if (updateData.shippingAddressLine2 !== undefined)
      props.shippingAddressLine2 = (updateData.shippingAddressLine2 as string) || undefined;
    if (updateData.shippingAddressCity !== undefined)
      props.shippingAddressCity = (updateData.shippingAddressCity as string) || undefined;
    if (updateData.shippingAddressState !== undefined)
      props.shippingAddressState = (updateData.shippingAddressState as string) || undefined;
    if (updateData.shippingAddressZipCode !== undefined)
      props.shippingAddressZipCode = (updateData.shippingAddressZipCode as string) || undefined;
    if (updateData.notes !== undefined) props.notes = (updateData.notes as string) || undefined;
    if (updateData.overrideDistrictBilling !== undefined)
      props.overrideDistrictBilling = (updateData.overrideDistrictBilling as boolean) || undefined;
    if (updateData.fax !== undefined) props.fax = (updateData.fax as string) || undefined;
    if (updateData.shippingInstructions !== undefined)
      props.shippingInstructions = (updateData.shippingInstructions as string) || undefined;
    if (updateData.shippingDeliveryHours !== undefined)
      props.shippingDeliveryHours = (updateData.shippingDeliveryHours as string) || undefined;

    return props;
  }
}

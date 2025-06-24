export interface IBidProps {
  id: number;
  code?: string | null; // Changed from `number` to `code` to match schema
  name: string | null;
  note?: string | null;
  bidYear?: string | null; // Made optional to match schema
  categoryId?: number | null;
  status: string | null;
  awardType?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  anticipatedOpeningDate?: Date | null;
  awardDate?: Date | null;
  userId?: number | null;
  description?: string | null;
  estimatedValue?: string | null;
  cooperativeId?: number | null; // Added to match schema
  districtId?: number | null; // Added to match schema
  schoolId?: number | null; // Added to match schema
  isDeleted?: boolean | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Bid {
  id: number;
  code?: string | null; // Changed from `number` to `code`
  name: string | null;
  note?: string | null;
  bidYear?: string | null; // Made optional
  categoryId?: number | null;
  status: string | null;
  awardType?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  anticipatedOpeningDate?: Date | null;
  awardDate?: Date | null;
  userId?: number | null;
  description?: string | null;
  estimatedValue?: string | null;
  cooperativeId?: number | null; // Added
  districtId?: number | null; // Added
  schoolId?: number | null; // Added
  isDeleted: boolean;
  createdAt: Date;
  updatedAt?: Date;

  constructor(props: IBidProps) {
    this.id = props.id;
    this.code = props.code;
    this.name = props.name;
    this.note = props.note;
    this.bidYear = props.bidYear;
    this.categoryId = props.categoryId;
    this.status = props.status;
    this.awardType = props.awardType;
    this.startDate = props.startDate;
    this.endDate = props.endDate;
    this.anticipatedOpeningDate = props.anticipatedOpeningDate;
    this.awardDate = props.awardDate;
    this.userId = props.userId;
    this.description = props.description;
    this.estimatedValue = props.estimatedValue;
    this.cooperativeId = props.cooperativeId;
    this.districtId = props.districtId;
    this.schoolId = props.schoolId;
    this.isDeleted = props.isDeleted ?? false; // Use nullish coalescing for cleaner default
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt;

    // Validate required fields
    Bid.validateName(this.name);
    Bid.validateStatus(this.status);
  }

  static validateName(name: string | null): void {
    if (!name || name.trim() === '') {
      throw new Error('name is required');
    }
  }

  static validateStatus(status: string | null): void {
    const validStatuses = ['In Process', 'Released', 'Opened', 'Awarded', 'Canceled', 'Archived', 'Draft', 'Pending Approval', 'Under Review'];
    if (!status || !validStatuses.includes(status)) {
      throw new Error('status must be one of: ' + validStatuses.join(', '));
    }
  }

  markAsReleased(): void {
    this.status = 'Released';
    this.updatedAt = new Date();
  }

  markAsOpened(): void {
    this.status = 'Opened';
    this.updatedAt = new Date();
  }

  markAsAwarded(): void {
    this.status = 'Awarded';
    this.updatedAt = new Date();
  }

  markAsCanceled(): void {
    this.status = 'Canceled';
    this.updatedAt = new Date();
  }

  markAsArchived(): void {
    this.status = 'Archived';
    this.updatedAt = new Date();
  }

  assignBidManager(userId: number): void {
    this.userId = userId;
    this.updatedAt = new Date();
  }

  updateEstimatedValue(estimatedValue: string): void {
    this.estimatedValue = estimatedValue;
    this.updatedAt = new Date();
  }

  assignCooperative(cooperativeId: number): void {
    this.cooperativeId = cooperativeId;
    this.updatedAt = new Date();
  }

  assignDistrict(districtId: number): void {
    this.districtId = districtId;
    this.updatedAt = new Date();
  }

  assignSchool(schoolId: number): void {
    this.schoolId = schoolId;
    this.updatedAt = new Date();
  }

  updateCode(code: string): void {
    if (code && code.length > 50) {
      throw new Error('code must not exceed 50 characters');
    }
    this.code = code;
    this.updatedAt = new Date();
  }
}
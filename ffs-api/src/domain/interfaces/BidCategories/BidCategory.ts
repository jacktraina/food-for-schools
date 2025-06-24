export interface IBidCategoryProps {
  id?: number;
  code: string;
  name: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class BidCategory {
  id?: number;
  code: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt?: Date;

  constructor(props: IBidCategoryProps) {
    this.id = props.id;
    this.code = props.code;
    this.name = props.name;
    this.description = props.description;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt;

    BidCategory.validateName(this.name);
    BidCategory.validateCode(this.code);
  }

  static validateName(name: string): void {
    if (!name || name.trim() === '') {
      throw new Error('name is required and cannot be empty');
    }
  }

  static validateCode(code: string): void {
    if (!code || code.trim() === '') {
      throw new Error('code is required and cannot be empty');
    }
  }
}

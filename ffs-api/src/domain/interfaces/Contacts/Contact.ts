export enum ContactType {
  DEFAULT = 'default',
  BILLING = 'billing',
  SCHOOL = 'school'
}

export interface IContactProps {
  id?: number;
  firstName: string;
  lastName: string;
  phone?: string | null;
  address1?: string | null;
  address2?: string | null;
  city?: string | null;
  state?: string | null;
  zipcode?: string | null;
  contactType: ContactType | string;
  email?: string | null;
  title?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Contact {
  id?: number;
  firstName: string;
  lastName: string;
  phone?: string | null;
  address1?: string | null;
  address2?: string | null;
  city?: string | null;
  state?: string | null;
  zipcode?: string | null;
  contactType: ContactType | string;
  email?: string | null;
  title?: string | null;
  createdAt: Date;
  updatedAt?: Date;

  constructor(props: IContactProps) {
    this.id = props.id;
    this.firstName = props.firstName;
    this.lastName = props.lastName;
    this.phone = props.phone ;
    this.address1 = props.address1;
    this.address2 = props.address2;
    this.city = props.city;
    this.state = props.state;
    this.zipcode = props.zipcode;
    this.contactType = props.contactType;
    this.email = props.email;
    this.title = props.title;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt;

    Contact.validateFirstName(this.firstName);
    Contact.validateLastName(this.lastName);
  }

  static validateFirstName(firstName: string): void {
    if (!firstName || firstName.trim() === '') {
      throw new Error('firstName is required and cannot be empty');
    }
  }

  static validateLastName(lastName: string): void {
    if (!lastName || lastName.trim() === '') {
      throw new Error('lastName is required and cannot be empty');
    }
  }

  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  update(props: Partial<IContactProps>): Contact {
    return new Contact({
      ...this.toJSON(),
      ...props,
      updatedAt: new Date(),
    });
  }

  toJSON(): IContactProps {
    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      phone: this.phone,
      address1: this.address1,
      address2: this.address2,
      city: this.city,
      state: this.state,
      zipcode: this.zipcode,
      contactType: this.contactType,
      email: this.email,
      title: this.title,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

import { Contact, ContactType } from '../../domain/interfaces/Contacts/Contact';

export class ContactMapper {
  static toPrisma(entity: Contact) {
    return {
      id: entity.id,
      firstName: entity.firstName,
      lastName: entity.lastName,
      phone: entity.phone,
      address1: entity.address1,
      address2: entity.address2,
      city: entity.city,
      state: entity.state,
      zipcode: entity.zipcode,
      contactType: entity.contactType,
      email: entity.email,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static toDomain(prismaModel: {
    id: number;
    firstName: string;
    lastName: string;
    phone: string | null;
    address1: string | null;
    address2: string | null;
    city: string | null;
    state: string | null;
    zipcode: string | null;
    contactType: string;
    email: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): Contact {
    return new Contact({
      id: prismaModel.id,
      firstName: prismaModel.firstName,
      lastName: prismaModel.lastName,
      phone: prismaModel.phone ?? undefined,
      address1: prismaModel.address1 ?? undefined,
      address2: prismaModel.address2 ?? undefined,
      city: prismaModel.city ?? undefined,
      state: prismaModel.state ?? undefined,
      zipcode: prismaModel.zipcode ?? undefined,
      contactType: prismaModel.contactType as ContactType,
      email: prismaModel.email ?? undefined,
      createdAt: prismaModel.createdAt,
      updatedAt: prismaModel.updatedAt,
    });
  }
}

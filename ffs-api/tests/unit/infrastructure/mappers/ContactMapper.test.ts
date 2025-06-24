import { ContactMapper } from '../../../../src/infrastructure/mappers/ContactMapper';
import { Contact, ContactType } from '../../../../src/domain/interfaces/Contacts/Contact';

describe('ContactMapper', () => {
  describe('toPrisma', () => {
    it('should map Contact entity to Prisma format', () => {
      const contact = new Contact({
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        phone: '555-1234',
        address1: '123 Main St',
        address2: 'Apt 1',
        city: 'Test City',
        state: 'TX',
        zipcode: '12345',
        contactType: ContactType.DEFAULT,
        email: 'john@example.com',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02')
      });

      const result = ContactMapper.toPrisma(contact);

      expect(result).toEqual({
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        phone: '555-1234',
        address1: '123 Main St',
        address2: 'Apt 1',
        city: 'Test City',
        state: 'TX',
        zipcode: '12345',
        contactType: ContactType.DEFAULT,
        email: 'john@example.com',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02')
      });
    });
  });

  describe('toDomain', () => {
    it('should map Prisma model to Contact domain entity with all fields populated', () => {
      const prismaModel = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        phone: '555-1234',
        address1: '123 Main St',
        address2: 'Apt 1',
        city: 'Test City',
        state: 'TX',
        zipcode: '12345',
        contactType: 'DEFAULT',
        email: 'john@example.com',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02')
      };

      const result = ContactMapper.toDomain(prismaModel);

      expect(result).toBeInstanceOf(Contact);
      expect(result.id).toBe(1);
      expect(result.firstName).toBe('John');
      expect(result.lastName).toBe('Doe');
      expect(result.phone).toBe('555-1234');
      expect(result.address1).toBe('123 Main St');
      expect(result.address2).toBe('Apt 1');
      expect(result.city).toBe('Test City');
      expect(result.state).toBe('TX');
      expect(result.zipcode).toBe('12345');
      expect(result.contactType).toBe('DEFAULT');
      expect(result.email).toBe('john@example.com');
    });

    it('should map Prisma model to Contact domain entity with null optional fields', () => {
      const prismaModel = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        phone: null,
        address1: null,
        address2: null,
        city: null,
        state: null,
        zipcode: null,
        contactType: 'DEFAULT',
        email: null,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02')
      };

      const result = ContactMapper.toDomain(prismaModel);

      expect(result).toBeInstanceOf(Contact);
      expect(result.phone).toBeUndefined();
      expect(result.address1).toBeUndefined();
      expect(result.address2).toBeUndefined();
      expect(result.city).toBeUndefined();
      expect(result.state).toBeUndefined();
      expect(result.zipcode).toBeUndefined();
      expect(result.email).toBeUndefined();
    });
  });
});

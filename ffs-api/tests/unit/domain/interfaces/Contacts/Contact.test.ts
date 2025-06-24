import { Contact, ContactType } from '../../../../../src/domain/interfaces/Contacts/Contact';

describe('Contact', () => {
  describe('constructor', () => {
    it('should create Contact with all properties', () => {
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

      expect(contact.id).toBe(1);
      expect(contact.firstName).toBe('John');
      expect(contact.lastName).toBe('Doe');
      expect(contact.phone).toBe('555-1234');
      expect(contact.contactType).toBe(ContactType.DEFAULT);
    });

    it('should set createdAt to current date when not provided', () => {
      const beforeCreate = new Date();
      const contact = new Contact({
        firstName: 'John',
        lastName: 'Doe',
        contactType: ContactType.DEFAULT
      });
      const afterCreate = new Date();

      expect(contact.createdAt).toBeInstanceOf(Date);
      expect(contact.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
      expect(contact.createdAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
    });
  });

  describe('validateFirstName', () => {
    it('should not throw error for valid firstName', () => {
      expect(() => Contact.validateFirstName('John')).not.toThrow();
    });

    it('should throw error for empty firstName', () => {
      expect(() => Contact.validateFirstName('')).toThrow('firstName is required and cannot be empty');
    });

    it('should throw error for whitespace-only firstName', () => {
      expect(() => Contact.validateFirstName('   ')).toThrow('firstName is required and cannot be empty');
    });

    it('should throw error for null firstName', () => {
      expect(() => Contact.validateFirstName(null as any)).toThrow('firstName is required and cannot be empty');
    });

    it('should throw error for undefined firstName', () => {
      expect(() => Contact.validateFirstName(undefined as any)).toThrow('firstName is required and cannot be empty');
    });
  });

  describe('validateLastName', () => {
    it('should not throw error for valid lastName', () => {
      expect(() => Contact.validateLastName('Doe')).not.toThrow();
    });

    it('should throw error for empty lastName', () => {
      expect(() => Contact.validateLastName('')).toThrow('lastName is required and cannot be empty');
    });

    it('should throw error for whitespace-only lastName', () => {
      expect(() => Contact.validateLastName('   ')).toThrow('lastName is required and cannot be empty');
    });

    it('should throw error for null lastName', () => {
      expect(() => Contact.validateLastName(null as any)).toThrow('lastName is required and cannot be empty');
    });

    it('should throw error for undefined lastName', () => {
      expect(() => Contact.validateLastName(undefined as any)).toThrow('lastName is required and cannot be empty');
    });
  });

  describe('getFullName', () => {
    it('should return full name', () => {
      const contact = new Contact({
        firstName: 'John',
        lastName: 'Doe',
        contactType: ContactType.DEFAULT
      });

      expect(contact.getFullName()).toBe('John Doe');
    });
  });

  describe('update', () => {
    it('should update contact properties and return new instance', () => {
      const originalContact = new Contact({
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        phone: '555-1234',
        email: 'john@example.com',
        contactType: ContactType.DEFAULT,
        createdAt: new Date('2023-01-01')
      });

      const updatedContact = originalContact.update({
        firstName: 'Jane',
        phone: '555-5678',
        title: 'Manager'
      });

      expect(updatedContact).not.toBe(originalContact);
      expect(updatedContact.id).toBe(1);
      expect(updatedContact.firstName).toBe('Jane');
      expect(updatedContact.lastName).toBe('Doe');
      expect(updatedContact.phone).toBe('555-5678');
      expect(updatedContact.email).toBe('john@example.com');
      expect(updatedContact.title).toBe('Manager');
      expect(updatedContact.contactType).toBe(ContactType.DEFAULT);
      expect(updatedContact.createdAt).toEqual(new Date('2023-01-01'));
      expect(updatedContact.updatedAt).toBeInstanceOf(Date);
    });

    it('should preserve original contact when updating', () => {
      const originalContact = new Contact({
        firstName: 'John',
        lastName: 'Doe',
        contactType: ContactType.DEFAULT
      });

      const updatedContact = originalContact.update({
        firstName: 'Jane'
      });

      expect(originalContact.firstName).toBe('John');
      expect(updatedContact.firstName).toBe('Jane');
    });
  });

  describe('toJSON', () => {
    it('should return contact properties as JSON object', () => {
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
        contactType: ContactType.BILLING,
        email: 'john@example.com',
        title: 'Manager',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02')
      });

      const json = contact.toJSON();

      expect(json).toEqual({
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        phone: '555-1234',
        address1: '123 Main St',
        address2: 'Apt 1',
        city: 'Test City',
        state: 'TX',
        zipcode: '12345',
        contactType: ContactType.BILLING,
        email: 'john@example.com',
        title: 'Manager',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02')
      });
    });

    it('should handle undefined values in toJSON', () => {
      const contact = new Contact({
        firstName: 'John',
        lastName: 'Doe',
        contactType: ContactType.DEFAULT
      });

      const json = contact.toJSON();

      expect(json.phone).toBeUndefined();
      expect(json.address1).toBeUndefined();
      expect(json.email).toBeUndefined();
      expect(json.title).toBeUndefined();
      expect(json.updatedAt).toBeUndefined();
    });
  });

  describe('constructor validation', () => {
    it('should throw error when firstName validation fails', () => {
      expect(() => new Contact({
        firstName: '',
        lastName: 'Doe',
        contactType: ContactType.DEFAULT
      })).toThrow('firstName is required and cannot be empty');
    });

    it('should throw error when lastName validation fails', () => {
      expect(() => new Contact({
        firstName: 'John',
        lastName: '',
        contactType: ContactType.DEFAULT
      })).toThrow('lastName is required and cannot be empty');
    });
  });
});

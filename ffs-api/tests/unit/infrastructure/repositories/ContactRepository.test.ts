import { ContactRepository } from '../../../../src/infrastructure/repositories/ContactRepository';
import { Contact } from '../../../../src/domain/interfaces/Contacts/Contact';

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    contacts: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  })),
}));

describe('ContactRepository', () => {
  let contactRepository: ContactRepository;
  let mockPrisma: any;

  const mockDatabaseService = {
    connect: jest.fn(),
    disconnect: jest.fn(),
    getClient: jest.fn().mockReturnValue({
      contacts: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    }),
    runInTransaction: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    contactRepository = new ContactRepository(mockDatabaseService);
    mockPrisma = (contactRepository as any).prisma;
  });

  describe('findAll', () => {
    it('should return all contacts as Contact instances', async () => {
      const mockContacts = [
        { 
          id: 1, 
          firstName: 'John', 
          lastName: 'Doe', 
          email: 'john@example.com',
          phone: '123-456-7890',
          address1: '123 Main St',
          address2: null,
          city: 'Anytown',
          state: 'NY',
          zipcode: '12345',
          contactType: 'PRIMARY',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        { 
          id: 2, 
          firstName: 'Jane', 
          lastName: 'Smith', 
          email: 'jane@example.com',
          phone: '987-654-3210',
          address1: '456 Oak Ave',
          address2: null,
          city: 'Somewhere',
          state: 'CA',
          zipcode: '54321',
          contactType: 'SECONDARY',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      mockPrisma.contacts.findMany.mockResolvedValue(mockContacts);

      const result = await contactRepository.findAll();

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Contact);
      expect(result[0].firstName).toBe('John');
      expect(mockPrisma.contacts.findMany).toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      mockPrisma.contacts.findMany.mockRejectedValue(new Error('Database error'));

      await expect(contactRepository.findAll()).rejects.toThrow('Database error');
    });
  });

  describe('findById', () => {
    it('should return contact when found', async () => {
      const mockContact = { 
        id: 1, 
        firstName: 'John', 
        lastName: 'Doe', 
        email: 'john@example.com',
        phone: '123-456-7890',
        address1: '123 Main St',
        address2: null,
        city: 'Anytown',
        state: 'NY',
        zipcode: '12345',
        contactType: 'PRIMARY',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      mockPrisma.contacts.findUnique.mockResolvedValue(mockContact);

      const result = await contactRepository.findById(1);

      expect(result).toBeInstanceOf(Contact);
      expect(result?.firstName).toBe('John');
      expect(mockPrisma.contacts.findUnique).toHaveBeenCalledWith({
        where: { id: 1 }
      });
    });

    it('should return null when not found', async () => {
      mockPrisma.contacts.findUnique.mockResolvedValue(null);

      const result = await contactRepository.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('createWithTransaction', () => {
    it('should create contact with transaction successfully', async () => {
      const contactData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '123-456-7890',
        address1: '123 Main St',
        city: 'Anytown',
        state: 'NY',
        zipcode: '12345',
        contactType: 'PRIMARY',
      };

      const mockContact = new Contact(contactData);
      const mockCreatedContact = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '123-456-7890',
        address1: '123 Main St',
        address2: null,
        city: 'Anytown',
        state: 'NY',
        zipcode: '12345',
        contactType: 'PRIMARY',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockPrismaTransaction = {
        contacts: {
          create: jest.fn().mockResolvedValue(mockCreatedContact)
        }
      };

      const result = await contactRepository.createWithTransaction(mockPrismaTransaction as any, mockContact);

      expect(result).toBeInstanceOf(Contact);
      expect(result.firstName).toBe('John');
      expect(mockPrismaTransaction.contacts.create).toHaveBeenCalledWith({
        data: {
          firstName: 'John',
          lastName: 'Doe',
          phone: '123-456-7890',
          address1: '123 Main St',
          address2: undefined,
          city: 'Anytown',
          state: 'NY',
          zipcode: '12345',
          contactType: 'PRIMARY',
          email: 'john@example.com',
        },
      });
    });

    it('should handle unique constraint error in transaction', async () => {
      const contactData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        contactType: 'PRIMARY',
      };

      const mockContact = new Contact(contactData);
      const uniqueConstraintError = new Error('Unique constraint failed');
      (uniqueConstraintError as any).code = 'P2002';

      const mockPrismaTransaction = {
        contacts: {
          create: jest.fn().mockRejectedValue(uniqueConstraintError)
        }
      };

      await expect(contactRepository.createWithTransaction(mockPrismaTransaction as any, mockContact))
        .rejects.toThrow('Unique constraint failed');
    });

    it('should handle general transaction errors', async () => {
      const contactData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        contactType: 'PRIMARY',
      };

      const mockContact = new Contact(contactData);
      const generalError = new Error('Database connection failed');

      const mockPrismaTransaction = {
        contacts: {
          create: jest.fn().mockRejectedValue(generalError)
        }
      };

      await expect(contactRepository.createWithTransaction(mockPrismaTransaction as any, mockContact))
        .rejects.toThrow('Database connection failed');
    });
  });
});

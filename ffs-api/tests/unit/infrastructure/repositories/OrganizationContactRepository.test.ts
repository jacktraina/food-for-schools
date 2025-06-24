import { OrganizationContactRepository } from '../../../../src/infrastructure/repositories/OrganizationContactRepository';
import { OrganizationContact } from '../../../../src/domain/interfaces/OrganizationContacts/OrganizationContact';

describe('OrganizationContactRepository', () => {
  let repository: OrganizationContactRepository;
  let mockDatabaseService: any;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      organizationContacts: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    mockDatabaseService = {
      connect: jest.fn(),
      disconnect: jest.fn(),
      getClient: jest.fn().mockReturnValue(mockPrisma),
      runInTransaction: jest.fn(),
    };

    repository = new OrganizationContactRepository(mockDatabaseService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create organization contact successfully', async () => {
      const organizationContact = new OrganizationContact({
        contactId: 1,
        organizationId: 2,
        organizationTypeId: 1,
        rank: 1,
        districtId: 2,
      });

      const mockCreatedOrgContact = {
        id: 1,
        contactId: 1,
        organizationId: 2,
        organizationTypeId: 1,
        rank: 1,
        districtId: 2,
        contact: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          contactType: 'PRIMARY',
        },
        district: { 
          id: 2, 
          name: 'Test District',
          statusId: 1,
          cooperativeId: 1,
          code: 'DIST-001',
          participatingIn: null,
          shippingAddress: null,
          description: null,
          notes: null,
          createdAt: new Date(),
          isDeleted: false,
          location: 'Test Location',
          directorName: 'John Director',
          streetAddress1: '123 Main St',
          streetAddress2: null,
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          phone: '555-0123',
          email: 'test@district.edu',
          fax: null,
          website: null,
          districtEnrollment: null,
          raNumber: null,
          numberOfSchools: null,
          numberOfStudents: null,
          annualBudget: null,
          superintendentName: null,
          establishedYear: null,
        },
        organizationType: { id: 1, name: 'District' }
      };

      mockPrisma.organizationContacts.create.mockResolvedValue(mockCreatedOrgContact);

      const result = await repository.create(organizationContact);

      expect(result).toBeInstanceOf(OrganizationContact);
      expect(result.contactId).toBe(1);
      expect(result.organizationId).toBe(2);
      expect(mockPrisma.organizationContacts.create).toHaveBeenCalledWith({
        data: {
          contactId: 1,
          organizationId: 2,
          organizationTypeId: 1,
          rank: 1,
          districtId: 2,
        },
        include: {
          contact: true,
          district: true,
          organizationType: true,
        },
      });
    });
  });

  describe('createWithTransaction', () => {
    it('should create organization contact with transaction successfully', async () => {
      const organizationContact = new OrganizationContact({
        contactId: 1,
        organizationId: 2,
        organizationTypeId: 1,
        rank: 1,
        districtId: 2,
      });

      const mockCreatedOrgContact = {
        id: 1,
        contactId: 1,
        organizationId: 2,
        organizationTypeId: 1,
        rank: 1,
        districtId: 2,
        contact: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          contactType: 'PRIMARY',
        },
        district: { 
          id: 2, 
          name: 'Test District',
          statusId: 1,
          cooperativeId: 1,
          code: 'DIST-001',
          participatingIn: null,
          shippingAddress: null,
          description: null,
          notes: null,
          createdAt: new Date(),
          isDeleted: false,
          location: 'Test Location',
          directorName: 'John Director',
          streetAddress1: '123 Main St',
          streetAddress2: null,
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          phone: '555-0123',
          email: 'test@district.edu',
          fax: null,
          website: null,
          districtEnrollment: null,
          raNumber: null,
          numberOfSchools: null,
          numberOfStudents: null,
          annualBudget: null,
          superintendentName: null,
          establishedYear: null,
        },
        organizationType: { id: 1, name: 'District' }
      };

      const mockPrismaTransaction = {
        organizationContacts: {
          create: jest.fn().mockResolvedValue(mockCreatedOrgContact)
        }
      };

      const result = await repository.createWithTransaction(mockPrismaTransaction as any, organizationContact);

      expect(result).toBeInstanceOf(OrganizationContact);
      expect(result.contactId).toBe(1);
      expect(result.organizationId).toBe(2);
      expect(mockPrismaTransaction.organizationContacts.create).toHaveBeenCalledWith({
        data: {
          contactId: 1,
          organizationId: 2,
          organizationTypeId: 1,
          rank: 1,
          districtId: 2,
        },
        include: {
          contact: true,
          district: true,
          organizationType: true,
        },
      });
    });

    it('should handle transaction errors', async () => {
      const organizationContact = new OrganizationContact({
        contactId: 1,
        organizationId: 2,
        organizationTypeId: 1,
        rank: 1,
        districtId: 2,
      });

      const mockPrismaTransaction = {
        organizationContacts: {
          create: jest.fn().mockRejectedValue(new Error('Transaction error'))
        }
      };

      await expect(repository.createWithTransaction(mockPrismaTransaction as any, organizationContact))
        .rejects.toThrow('Transaction error');
    });

    it('should handle unique constraint error in transaction', async () => {
      const organizationContact = new OrganizationContact({
        contactId: 1,
        organizationId: 2,
        organizationTypeId: 1,
        rank: 1,
        districtId: 2,
      });

      const uniqueConstraintError = new Error('Unique constraint failed');
      (uniqueConstraintError as any).code = 'P2002';

      const mockPrismaTransaction = {
        organizationContacts: {
          create: jest.fn().mockRejectedValue(uniqueConstraintError)
        }
      };

      await expect(repository.createWithTransaction(mockPrismaTransaction as any, organizationContact))
        .rejects.toThrow('Unique constraint failed');
    });
  });

  describe('findById', () => {
    it('should find organization contact by ID', async () => {
      const id = 1;
      const mockOrgContact = {
        id: 1,
        contactId: 1,
        organizationId: 2,
        organizationTypeId: 1,
        rank: 1,
        districtId: 2,
        contact: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          contactType: 'PRIMARY',
        },
        district: { 
          id: 2, 
          name: 'Test District',
          statusId: 1,
          cooperativeId: 1,
          code: 'DIST-001',
          participatingIn: null,
          shippingAddress: null,
          description: null,
          notes: null,
          createdAt: new Date(),
          isDeleted: false,
          location: 'Test Location',
          directorName: 'John Director',
          streetAddress1: '123 Main St',
          streetAddress2: null,
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          phone: '555-0123',
          email: 'test@district.edu',
          fax: null,
          website: null,
          districtEnrollment: null,
          raNumber: null,
          numberOfSchools: null,
          numberOfStudents: null,
          annualBudget: null,
          superintendentName: null,
          establishedYear: null,
        },
        organizationType: { id: 1, name: 'District' }
      };

      mockPrisma.organizationContacts.findUnique.mockResolvedValue(mockOrgContact);

      const result = await repository.findById(id);

      expect(result).toBeInstanceOf(OrganizationContact);
      expect(result?.id).toBe(1);
      expect(mockPrisma.organizationContacts.findUnique).toHaveBeenCalledWith({
        where: { id },
        include: {
          contact: true,
          district: true,
          organizationType: true,
        },
      });
    });

    it('should return null when organization contact not found', async () => {
      const id = 999;

      mockPrisma.organizationContacts.findUnique.mockResolvedValue(null);

      const result = await repository.findById(id);

      expect(result).toBeNull();
    });
  });

  describe('findByOrganizationId', () => {
    it('should find organization contacts by organization ID', async () => {
      const organizationId = 2;
      const mockOrgContacts = [
        {
          id: 1,
          contactId: 1,
          organizationId: 2,
          organizationTypeId: 1,
          rank: 1,
          districtId: 2,
          contact: {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            contactType: 'PRIMARY',
          },
          district: { 
            id: 2, 
            name: 'Test District',
            statusId: 1,
            cooperativeId: 1,
            code: 'DIST-001',
            participatingIn: null,
            shippingAddress: null,
            description: null,
            notes: null,
            createdAt: new Date(),
            isDeleted: false,
            location: 'Test Location',
            directorName: 'John Director',
            streetAddress1: '123 Main St',
            streetAddress2: null,
            city: 'Test City',
            state: 'TS',
            zipCode: '12345',
            phone: '555-0123',
            email: 'test@district.edu',
            fax: null,
            website: null,
            districtEnrollment: null,
            raNumber: null,
            numberOfSchools: null,
            numberOfStudents: null,
            annualBudget: null,
            superintendentName: null,
            establishedYear: null,
          },
          organizationType: { id: 1, name: 'District' }
        },
      ];

      mockPrisma.organizationContacts.findMany.mockResolvedValue(mockOrgContacts);

      const result = await repository.findByOrganizationId(organizationId);

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(OrganizationContact);
      expect(mockPrisma.organizationContacts.findMany).toHaveBeenCalledWith({
        where: { organizationId },
        include: {
          contact: true,
          district: true,
          organizationType: true,
        },
      });
    });
  });

  describe('findByContactId', () => {
    it('should find organization contacts by contact ID', async () => {
      const contactId = 1;
      const mockOrgContacts = [
        {
          id: 1,
          contactId: 1,
          organizationId: 2,
          organizationTypeId: 1,
          rank: 1,
          districtId: 2,
          contact: {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            contactType: 'PRIMARY',
          },
          district: { 
            id: 2, 
            name: 'Test District',
            statusId: 1,
            cooperativeId: 1,
            code: 'DIST-001',
            participatingIn: null,
            shippingAddress: null,
            description: null,
            notes: null,
            createdAt: new Date(),
            isDeleted: false,
            location: 'Test Location',
            directorName: 'John Director',
            streetAddress1: '123 Main St',
            streetAddress2: null,
            city: 'Test City',
            state: 'TS',
            zipCode: '12345',
            phone: '555-0123',
            email: 'test@district.edu',
            fax: null,
            website: null,
            districtEnrollment: null,
            raNumber: null,
            numberOfSchools: null,
            numberOfStudents: null,
            annualBudget: null,
            superintendentName: null,
            establishedYear: null,
          },
          organizationType: { id: 1, name: 'District' }
        },
      ];

      mockPrisma.organizationContacts.findMany.mockResolvedValue(mockOrgContacts);

      const result = await repository.findByContactId(contactId);

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(OrganizationContact);
      expect(mockPrisma.organizationContacts.findMany).toHaveBeenCalledWith({
        where: { contactId },
        include: {
          contact: true,
          district: true,
          organizationType: true,
        },
      });
    });
  });

  describe('findAll', () => {
    it('should find all organization contacts', async () => {
      const mockOrgContacts = [
        {
          id: 1,
          contactId: 1,
          organizationId: 2,
          organizationTypeId: 1,
          rank: 1,
          districtId: 2,
          contact: {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            contactType: 'PRIMARY',
          },
          district: { 
            id: 2, 
            name: 'Test District',
            statusId: 1,
            cooperativeId: 1,
            code: 'DIST-001',
            participatingIn: null,
            shippingAddress: null,
            description: null,
            notes: null,
            createdAt: new Date(),
            isDeleted: false,
            location: 'Test Location',
            directorName: 'John Director',
            streetAddress1: '123 Main St',
            streetAddress2: null,
            city: 'Test City',
            state: 'TS',
            zipCode: '12345',
            phone: '555-0123',
            email: 'test@district.edu',
            fax: null,
            website: null,
            districtEnrollment: null,
            raNumber: null,
            numberOfSchools: null,
            numberOfStudents: null,
            annualBudget: null,
            superintendentName: null,
            establishedYear: null,
          },
          organizationType: { id: 1, name: 'District' }
        },
      ];

      mockPrisma.organizationContacts.findMany.mockResolvedValue(mockOrgContacts);

      const result = await repository.findAll();

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(OrganizationContact);
      expect(mockPrisma.organizationContacts.findMany).toHaveBeenCalledWith({
        include: {
          contact: true,
          district: true,
          organizationType: true,
        },
      });
    });
  });

  describe('update', () => {
    it('should update organization contact', async () => {
      const organizationContact = new OrganizationContact({
        id: 1,
        contactId: 1,
        organizationId: 2,
        organizationTypeId: 1,
        rank: 2,
        districtId: 2,
      });

      const mockUpdatedOrgContact = {
        id: 1,
        contactId: 1,
        organizationId: 2,
        organizationTypeId: 1,
        rank: 2,
        districtId: 2,
        contact: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          contactType: 'PRIMARY',
        },
        district: { 
          id: 2, 
          name: 'Test District',
          statusId: 1,
          cooperativeId: 1,
          code: 'DIST-001',
          participatingIn: null,
          shippingAddress: null,
          description: null,
          notes: null,
          createdAt: new Date(),
          isDeleted: false,
          location: 'Test Location',
          directorName: 'John Director',
          streetAddress1: '123 Main St',
          streetAddress2: null,
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          phone: '555-0123',
          email: 'test@district.edu',
          fax: null,
          website: null,
          districtEnrollment: null,
          raNumber: null,
          numberOfSchools: null,
          numberOfStudents: null,
          annualBudget: null,
          superintendentName: null,
          establishedYear: null,
        },
        organizationType: { id: 1, name: 'District' }
      };

      mockPrisma.organizationContacts.update.mockResolvedValue(mockUpdatedOrgContact);

      const result = await repository.update(organizationContact);

      expect(result).toBeInstanceOf(OrganizationContact);
      expect(result.rank).toBe(2);
      expect(mockPrisma.organizationContacts.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          contactId: 1,
          organizationId: 2,
          organizationTypeId: 1,
          rank: 2,
          districtId: 2,
        },
        include: {
          contact: true,
          district: true,
          organizationType: true,
        },
      });
    });
  });

  describe('delete', () => {
    it('should delete organization contact', async () => {
      const id = 1;

      mockPrisma.organizationContacts.delete.mockResolvedValue({ id });

      const result = await repository.delete(id);

      expect(result).toBe(true);
      expect(mockPrisma.organizationContacts.delete).toHaveBeenCalledWith({
        where: { id },
      });
    });

    it('should return false when delete fails', async () => {
      const id = 999;

      mockPrisma.organizationContacts.delete.mockRejectedValue(new Error('Record not found'));

      const result = await repository.delete(id);

      expect(result).toBe(false);
    });
  });
});

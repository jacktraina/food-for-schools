import { CooperativeMapper } from '../../../../src/infrastructure/mappers/CooperativeMapper';
import { Cooperative } from '../../../../src/domain/interfaces/Cooperatives/Cooperative';
import { OrganizationType } from '../../../../src/domain/interfaces/organizationTypes/OrganizationType';
import { UserStatus } from '../../../../src/domain/interfaces/userStatuses/UserStatus';

describe('CooperativeMapper', () => {
  describe('toPrisma', () => {
    it('should map Cooperative entity to Prisma format', () => {
      const cooperative = new Cooperative({
        id: 1,
        code: 'COOP-001',
        name: 'Test Cooperative',
        organizationTypeId: 1,
        address: '123 Main St',
        city: 'Test City',
        state: 'TX',
        zip: '12345',
        phone: '555-1234',
        fax: '555-5678',
        email: 'test@coop.com',
        website: 'https://test.com',
        logo: 'logo.png',
        description: 'Test description',
        enrollment: 100,
        location: 'Test Location',
        directorsName: 'John Doe',
        raNumber: 'RA123',
        superintendent: 'Jane Smith',
        established: 2020,
        userStatusId: 1,
        budget: 50000,
        lastUpdated: new Date('2023-01-01'),
        participatingIn: 'Program A',
        shippingAddress: '456 Ship St',
        notes: 'Test notes',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02')
      });

      const result = CooperativeMapper.toPrisma(cooperative);

      expect(result).toEqual({
        id: 1,
        code: 'COOP-001',
        name: 'Test Cooperative',
        organizationTypeId: 1,
        address: '123 Main St',
        city: 'Test City',
        state: 'TX',
        zip: '12345',
        phone: '555-1234',
        fax: '555-5678',
        email: 'test@coop.com',
        website: 'https://test.com',
        logo: 'logo.png',
        description: 'Test description',
        enrollment: 100,
        location: 'Test Location',
        directorsName: 'John Doe',
        raNumber: 'RA123',
        superintendent: 'Jane Smith',
        established: 2020,
        userStatusId: 1,
        budget: 50000,
        lastUpdated: new Date('2023-01-01'),
        participatingIn: 'Program A',
        shippingAddress: '456 Ship St',
        notes: 'Test notes',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02')
      });
    });
  });

  describe('toDomain', () => {
    it('should map Prisma model to Cooperative domain entity with all fields populated', () => {
      const prismaModel = {
        id: 1,
        code: 'COOP-001',
        name: 'Test Cooperative',
        organizationTypeId: 1,
        address: '123 Main St',
        city: 'Test City',
        state: 'TX',
        zip: '12345',
        phone: '555-1234',
        fax: '555-5678',
        email: 'test@coop.com',
        website: 'https://test.com',
        logo: 'logo.png',
        description: 'Test description',
        enrollment: 100,
        location: 'Test Location',
        directorsName: 'John Doe',
        raNumber: 'RA123',
        superintendent: 'Jane Smith',
        established: 2020,
        userStatusId: 1,
        budget: 50000,
        lastUpdated: new Date('2023-01-01'),
        participatingIn: 'Program A',
        shippingAddress: '456 Ship St',
        notes: 'Test notes',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
        organizationType: { id: 1, name: 'Cooperative' },
        userStatus: { id: 1, name: 'Active' }
      };

      const result = CooperativeMapper.toDomain(prismaModel);

      expect(result).toBeInstanceOf(Cooperative);
      expect(result.id).toBe(1);
      expect(result.code).toBe('COOP-001');
      expect(result.name).toBe('Test Cooperative');
      expect(result.address).toBe('123 Main St');
      expect(result.organizationType).toBeInstanceOf(OrganizationType);
      expect(result.userStatus).toBeInstanceOf(UserStatus);
    });

    it('should map Prisma model to Cooperative domain entity with null fields', () => {
      const prismaModel = {
        id: 1,
        code: 'COOP-001',
        name: 'Test Cooperative',
        organizationTypeId: 1,
        address: null,
        city: null,
        state: null,
        zip: null,
        phone: null,
        fax: null,
        email: null,
        website: null,
        logo: null,
        description: null,
        enrollment: null,
        location: null,
        directorsName: null,
        raNumber: null,
        superintendent: null,
        established: null,
        userStatusId: 1,
        budget: null,
        lastUpdated: null,
        participatingIn: null,
        shippingAddress: null,
        notes: null,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02')
      };

      const result = CooperativeMapper.toDomain(prismaModel);

      expect(result).toBeInstanceOf(Cooperative);
      expect(result.address).toBeUndefined();
      expect(result.city).toBeUndefined();
      expect(result.state).toBeUndefined();
      expect(result.zip).toBeUndefined();
      expect(result.phone).toBeUndefined();
      expect(result.fax).toBeUndefined();
      expect(result.email).toBeUndefined();
      expect(result.website).toBeUndefined();
      expect(result.logo).toBeUndefined();
      expect(result.description).toBeUndefined();
      expect(result.enrollment).toBeUndefined();
      expect(result.location).toBeUndefined();
      expect(result.directorsName).toBeUndefined();
      expect(result.raNumber).toBeUndefined();
      expect(result.superintendent).toBeUndefined();
      expect(result.established).toBeUndefined();
      expect(result.budget).toBeUndefined();
      expect(result.lastUpdated).toBeUndefined();
      expect(result.participatingIn).toBeUndefined();
      expect(result.shippingAddress).toBeUndefined();
      expect(result.notes).toBeUndefined();
      expect(result.organizationType).toBeUndefined();
      expect(result.userStatus).toBeUndefined();
    });

    it('should map Prisma model without organizationType and userStatus', () => {
      const prismaModel = {
        id: 1,
        code: 'COOP-001',
        name: 'Test Cooperative',
        organizationTypeId: 1,
        address: null,
        city: null,
        state: null,
        zip: null,
        phone: null,
        fax: null,
        email: null,
        website: null,
        logo: null,
        description: null,
        enrollment: null,
        location: null,
        directorsName: null,
        raNumber: null,
        superintendent: null,
        established: null,
        userStatusId: 1,
        budget: null,
        lastUpdated: null,
        participatingIn: null,
        shippingAddress: null,
        notes: null,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02')
      };

      const result = CooperativeMapper.toDomain(prismaModel);

      expect(result.organizationType).toBeUndefined();
      expect(result.userStatus).toBeUndefined();
    });
  });
});

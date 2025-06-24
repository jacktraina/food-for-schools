import { OrganizationContactMapper } from '../../../../src/infrastructure/mappers/OrganizationContactMapper';
import { OrganizationContact } from '../../../../src/domain/interfaces/OrganizationContacts/OrganizationContact';
import { District } from '../../../../src/domain/interfaces/Districts/District';
import { OrganizationType } from '../../../../src/domain/interfaces/organizationTypes/OrganizationType';
import { Contact } from '../../../../src/domain/interfaces/Contacts/Contact';

describe('OrganizationContactMapper', () => {
  describe('toPrisma', () => {
    it('should map OrganizationContact entity to Prisma format', () => {
      const organizationContact = new OrganizationContact({
        id: 1,
        contactId: 1,
        organizationId: 1,
        organizationTypeId: 1,
        rank: 1,
        districtId: 1
      });

      const result = OrganizationContactMapper.toPrisma(organizationContact);

      expect(result).toEqual({
        id: 1,
        contactId: 1,
        organizationId: 1,
        organizationTypeId: 1,
        rank: 1,
        districtId: 1
      });
    });
  });

  describe('toDomain', () => {
    it('should map Prisma model to OrganizationContact domain entity with all relations', () => {
      const prismaModel = {
        id: 1,
        contactId: 1,
        organizationId: 1,
        organizationTypeId: 1,
        rank: 1,
        districtId: 1,
        contact: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          phone: '555-1234',
          address1: '123 Main St',
          address2: null,
          city: 'Test City',
          state: 'TX',
          zipcode: '12345',
          contactType: 'PRIMARY',
          email: 'john@example.com',
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-02')
        },
        district: {
          id: 1,
          code: 'DIST-001',
          name: 'Test District',
          userStatusId: 1
        },
        organizationType: {
          id: 1,
          name: 'District'
        }
      };

      const result = OrganizationContactMapper.toDomain(prismaModel);

      expect(result).toBeInstanceOf(OrganizationContact);
      expect(result.id).toBe(1);
      expect(result.contactId).toBe(1);
      expect(result.organizationId).toBe(1);
      expect(result.organizationTypeId).toBe(1);
      expect(result.rank).toBe(1);
      expect(result.districtId).toBe(1);
      expect(result.contact).toBeInstanceOf(Contact);
      expect(result.district).toBeInstanceOf(District);
      expect(result.organizationType).toBeInstanceOf(OrganizationType);
    });

    it('should map Prisma model to OrganizationContact domain entity without relations', () => {
      const prismaModel = {
        id: 1,
        contactId: 1,
        organizationId: 1,
        organizationTypeId: 1,
        rank: 1,
        districtId: null
      };

      const result = OrganizationContactMapper.toDomain(prismaModel);

      expect(result).toBeInstanceOf(OrganizationContact);
      expect(result.districtId).toBeUndefined();
      expect(result.contact).toBeUndefined();
      expect(result.district).toBeUndefined();
      expect(result.organizationType).toBeUndefined();
    });

    it('should map Prisma model with contact but without district and organizationType', () => {
      const prismaModel = {
        id: 1,
        contactId: 1,
        organizationId: 1,
        organizationTypeId: 1,
        rank: 1,
        districtId: null,
        contact: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          phone: '555-1234',
          address1: '123 Main St',
          address2: null,
          city: 'Test City',
          state: 'TX',
          zipcode: '12345',
          contactType: 'PRIMARY',
          email: 'john@example.com',
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-02')
        }
      };

      const result = OrganizationContactMapper.toDomain(prismaModel);

      expect(result.contact).toBeInstanceOf(Contact);
      expect(result.district).toBeUndefined();
      expect(result.organizationType).toBeUndefined();
    });
  });
});

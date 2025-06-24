import { OrganizationService } from '../../../../src/application/services/OrganizationService';
import { ICooperativeRepository } from '../../../../src/domain/interfaces/Cooperatives/ICooperativeRepository';
import { IDistrictRepository } from '../../../../src/domain/interfaces/Districts/IDistrictRepository';
import { IUserRepository } from '../../../../src/domain/interfaces/users/IUserRepository';
import { IInvitationRepository } from '../../../../src/domain/interfaces/invitations/IInvitationRepository';
import { IEmailServicePort } from '../../../../src/domain/core/IEmailServicePort';
import { EmailTemplates } from '../../../../src/shared/emailTemplates/EmailTemplates';
import { IDatabaseService } from '../../../../src/application/contracts/IDatabaseService';
import { BadRequestError } from '../../../../src/domain/core/errors/BadRequestError';
import { NotFoundError } from '../../../../src/domain/core/errors/NotFoundError';
import { ForbiddenError } from '../../../../src/domain/core/errors/ForbiddenError';
import { User } from '../../../../src/domain/interfaces/users/User';
import { Cooperative } from '../../../../src/domain/interfaces/Cooperatives/Cooperative';
import { District } from '../../../../src/domain/interfaces/Districts/District';
import { Invitation } from '../../../../src/domain/interfaces/invitations/Invitation';
import { InvitationStatusEnum } from '../../../../src/domain/constants/InvitationStatusEnum';

describe('OrganizationService', () => {
  let organizationService: OrganizationService;
  let mockCooperativeRepository: jest.Mocked<ICooperativeRepository>;
  let mockDistrictRepository: jest.Mocked<IDistrictRepository>;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockInvitationRepository: jest.Mocked<IInvitationRepository>;
  let mockEmailService: jest.Mocked<IEmailServicePort>;
  let mockOneSignalService: any;
  let mockEmailTemplates: jest.Mocked<EmailTemplates>;
  let mockDatabaseService: jest.Mocked<IDatabaseService>;

  beforeEach(() => {
    mockCooperativeRepository = {
      create: jest.fn(),
      createWithTransaction: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findByCode: jest.fn(),
      update: jest.fn(),
      updateWithTransaction: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<ICooperativeRepository>;

    mockDistrictRepository = {
      create: jest.fn(),
      createWithTransaction: jest.fn(),
      findAll: jest.fn(),
      findByCooperativeId: jest.fn(),
      findByIds: jest.fn(),
      update: jest.fn(),
      updateWithTransaction: jest.fn(),
      findLastDistrictCode: jest.fn(),
      countByCooperativeId: jest.fn(),
    } as unknown as jest.Mocked<IDistrictRepository>;

    mockUserRepository = {
      getUserDetails: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<IUserRepository>;

    mockInvitationRepository = {
      create: jest.fn(),
      createWithTransaction: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      findByToken: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<IInvitationRepository>;

    mockEmailService = {
      sendEmail: jest.fn(),
    } as unknown as jest.Mocked<IEmailServicePort>;

    mockOneSignalService = {
      sendEmail: jest.fn(),
      sendPushNotification: jest.fn(),
    } as any;

    mockEmailTemplates = {
      generateInvitationEmailTemplate: jest.fn(),
    } as unknown as jest.Mocked<EmailTemplates>;

    mockDatabaseService = {
      connect: jest.fn(),
      disconnect: jest.fn(),
      getClient: jest.fn(),
      runInTransaction: jest.fn(),
    } as unknown as jest.Mocked<IDatabaseService>;

    organizationService = new OrganizationService(
      mockCooperativeRepository,
      mockDistrictRepository,
      mockUserRepository,
      mockInvitationRepository,
      mockEmailService,
      mockOneSignalService,
      mockEmailTemplates,
      mockDatabaseService
    );

    jest.clearAllMocks();
  });

  describe('inviteOrganization', () => {
    const mockSuperAdminUser = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      getAdminRoles: jest.fn().mockReturnValue([
        { role: { name: 'Super-Admin' } }
      ])
    } as any;

    const mockNonAdminUser = {
      id: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      getAdminRoles: jest.fn().mockReturnValue([
        { role: { name: 'Regular-User' } }
      ])
    } as any;

    beforeEach(() => {
      process.env.CLIENT_URL = 'https://test.com';
      process.env.COMPANY_NAME = 'Test Company';
    });

    it('should invite a cooperative successfully', async () => {
      const inviteData = {
        email: 'test@coop.com',
        organization_type: 'cooperative' as const,
        name: 'Test Cooperative'
      };

      const mockCreatedCoop = {
        id: 1,
        code: 'TEST-001',
        name: 'Test Cooperative',
        organizationTypeId: 1,
        userStatusId: 1,
        description: null,
        createdAt: new Date(),
        updatedAt: new Date()
      } as any;

      mockUserRepository.getUserDetails.mockResolvedValue(mockSuperAdminUser);
      mockCooperativeRepository.findAll.mockResolvedValue([]);
      mockCooperativeRepository.createWithTransaction.mockResolvedValue(mockCreatedCoop);
      mockInvitationRepository.findByEmail.mockResolvedValue(null);
      mockInvitationRepository.createWithTransaction.mockResolvedValue({} as any);
      mockEmailTemplates.generateInvitationEmailTemplate.mockReturnValue('Email body');
      mockEmailService.sendEmail.mockResolvedValue();
      mockDatabaseService.runInTransaction.mockImplementation(async (callback) => {
        const mockPrisma = {} as any;
        return await callback(mockPrisma);
      });

      const result = await organizationService.inviteOrganization(inviteData, 1);

      expect(result).toEqual({ message: 'Organization invitation sent' });
      expect(mockDatabaseService.runInTransaction).toHaveBeenCalled();
      expect(mockCooperativeRepository.createWithTransaction).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          name: 'Test Cooperative',
          organizationTypeId: 1,
          userStatusId: 1
        })
      );
      expect(mockInvitationRepository.createWithTransaction).toHaveBeenCalled();
      expect(mockOneSignalService.sendEmail).toHaveBeenCalled();
    });

    it('should invite a district successfully', async () => {
      const inviteData = {
        email: 'test@district.com',
        organization_type: 'district' as const,
        name: 'Test District'
      };

      const mockCreatedDistrict = {
        id: 1,
        name: 'Test District',
        statusId: 1
      } as any;

      mockUserRepository.getUserDetails.mockResolvedValue(mockSuperAdminUser);
      mockDistrictRepository.findAll.mockResolvedValue([]);
      mockDistrictRepository.createWithTransaction.mockResolvedValue(mockCreatedDistrict);
      mockInvitationRepository.findByEmail.mockResolvedValue(null);
      mockInvitationRepository.createWithTransaction.mockResolvedValue({} as any);
      mockEmailTemplates.generateInvitationEmailTemplate.mockReturnValue('Email body');
      mockEmailService.sendEmail.mockResolvedValue();
      mockDatabaseService.runInTransaction.mockImplementation(async (callback) => {
        const mockPrisma = {} as any;
        return await callback(mockPrisma);
      });

      const result = await organizationService.inviteOrganization(inviteData, 1);

      expect(result).toEqual({ message: 'Organization invitation sent' });
      expect(mockDatabaseService.runInTransaction).toHaveBeenCalled();
      expect(mockDistrictRepository.createWithTransaction).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          name: 'Test District',
          statusId: 1
        })
      );
    });

    it('should throw NotFoundError when inviter not found', async () => {
      const inviteData = {
        email: 'test@example.com',
        organization_type: 'cooperative' as const,
        name: 'Test Org'
      };

      mockUserRepository.getUserDetails.mockResolvedValue(null);

      await expect(organizationService.inviteOrganization(inviteData, 999))
        .rejects.toThrow(NotFoundError);
    });

    it('should throw ForbiddenError when user is not Super-Admin', async () => {
      const inviteData = {
        email: 'test@example.com',
        organization_type: 'cooperative' as const,
        name: 'Test Org'
      };

      mockUserRepository.getUserDetails.mockResolvedValue(mockNonAdminUser);

      await expect(organizationService.inviteOrganization(inviteData, 2))
        .rejects.toThrow(ForbiddenError);
    });

    it('should throw BadRequestError when cooperative name already exists', async () => {
      const inviteData = {
        email: 'test@example.com',
        organization_type: 'cooperative' as const,
        name: 'Existing Cooperative'
      };

      const existingCoop = {
        id: 1,
        code: 'EXIST-001',
        name: 'Existing Cooperative',
        organizationTypeId: 1,
        userStatusId: 1,
        description: null,
        createdAt: new Date(),
        updatedAt: new Date()
      } as any;

      mockUserRepository.getUserDetails.mockResolvedValue(mockSuperAdminUser);
      mockCooperativeRepository.findAll.mockResolvedValue([existingCoop]);

      await expect(organizationService.inviteOrganization(inviteData, 1))
        .rejects.toThrow(BadRequestError);
    });

    it('should throw BadRequestError when district name already exists', async () => {
      const inviteData = {
        email: 'test@example.com',
        organization_type: 'district' as const,
        name: 'Existing District'
      };

      const existingDistrict = {
        id: 1,
        name: 'Existing District'
      } as any;

      mockUserRepository.getUserDetails.mockResolvedValue(mockSuperAdminUser);
      mockDistrictRepository.findAll.mockResolvedValue([existingDistrict]);

      await expect(organizationService.inviteOrganization(inviteData, 1))
        .rejects.toThrow(BadRequestError);
    });

    it('should throw BadRequestError for invalid organization type', async () => {
      const inviteData = {
        email: 'test@example.com',
        organization_type: 'invalid' as any,
        name: 'Test Org'
      };

      mockUserRepository.getUserDetails.mockResolvedValue(mockSuperAdminUser);

      await expect(organizationService.inviteOrganization(inviteData, 1))
        .rejects.toThrow(BadRequestError);
    });

    it('should throw BadRequestError when invitation already exists', async () => {
      const inviteData = {
        email: 'test@example.com',
        organization_type: 'cooperative' as const,
        name: 'Test Cooperative'
      };

      const existingInvitation = {
        id: 1,
        email: 'test@example.com',
        statusId: InvitationStatusEnum.PENDING
      } as any;

      const mockCreatedCoop = {
        id: 1,
        code: 'TEST-001',
        name: 'Test Cooperative',
        organizationTypeId: 1,
        userStatusId: 1,
        description: null,
        createdAt: new Date(),
        updatedAt: new Date()
      } as any;

      mockUserRepository.getUserDetails.mockResolvedValue(mockSuperAdminUser);
      mockCooperativeRepository.findAll.mockResolvedValue([]);
      mockCooperativeRepository.create.mockResolvedValue(mockCreatedCoop);
      mockInvitationRepository.findByEmail.mockResolvedValue(existingInvitation);

      await expect(organizationService.inviteOrganization(inviteData, 1))
        .rejects.toThrow(BadRequestError);
    });
  });

  describe('updateOrganization', () => {
    const mockSuperAdminUser = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      getAdminRoles: jest.fn().mockReturnValue([
        { role: { name: 'Super-Admin' } }
      ])
    } as any;

    const mockNonAdminUser = {
      id: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      getAdminRoles: jest.fn().mockReturnValue([
        { role: { name: 'Regular-User' } }
      ])
    } as any;

    it('should throw NotFoundError when updater not found', async () => {
      mockUserRepository.getUserDetails.mockResolvedValue(null);

      await expect(organizationService.updateOrganization(1, {}, 999))
        .rejects.toThrow(NotFoundError);
    });

    it('should throw ForbiddenError when user is not Super-Admin', async () => {
      mockUserRepository.getUserDetails.mockResolvedValue(mockNonAdminUser);

      await expect(organizationService.updateOrganization(1, {}, 2))
        .rejects.toThrow(ForbiddenError);
    });

    it('should throw NotFoundError when organization not found', async () => {
      mockUserRepository.getUserDetails.mockResolvedValue(mockSuperAdminUser);
      mockCooperativeRepository.findById.mockResolvedValue(null);
      mockDistrictRepository.findByIds.mockResolvedValue(null);

      await expect(organizationService.updateOrganization(1, {}, 1))
        .rejects.toThrow(NotFoundError);
    });

    it('should update cooperative successfully', async () => {
      const updateData = {
        streetAddress1: '123 Main St',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345',
        phone: '555-1234',
        email: 'test@example.com'
      };

      const mockCooperative = {
        id: 1,
        code: 'TEST-001',
        name: 'Test Cooperative',
        organizationTypeId: 1,
        userStatusId: 1,
        address: '456 Old St',
        city: 'Old City',
        state: 'OS',
        zip: '54321',
        phone: '555-5678',
        email: 'old@example.com',
        update: jest.fn().mockReturnValue({
          id: 1,
          code: 'TEST-001',
          name: 'Test Cooperative',
          organizationTypeId: 1,
          userStatusId: 1,
          address: '123 Main St',
          city: 'Test City',
          state: 'TS',
          zip: '12345',
          phone: '555-1234',
          email: 'test@example.com'
        })
      } as any;

      mockUserRepository.getUserDetails.mockResolvedValue(mockSuperAdminUser);
      mockCooperativeRepository.findById.mockResolvedValue(mockCooperative);
      mockCooperativeRepository.updateWithTransaction.mockResolvedValue(mockCooperative);
      mockDatabaseService.runInTransaction.mockImplementation(async (callback) => {
        const mockPrisma = {} as any;
        return await callback(mockPrisma);
      });

      const result = await organizationService.updateOrganization(1, updateData, 1);

      expect(result).toEqual({ message: 'Organization updated successfully' });
      expect(mockDatabaseService.runInTransaction).toHaveBeenCalled();
      expect(mockCooperativeRepository.updateWithTransaction).toHaveBeenCalled();
    });

    it('should update district successfully', async () => {
      const updateData = {
        streetAddress1: '789 District Ave',
        city: 'District City',
        state: 'DC',
        zipCode: '67890',
        phone: '555-9876',
        email: 'district@example.com'
      };

      const mockDistrict = {
        id: 1,
        name: 'Test District',
        statusId: 1,
        update: jest.fn().mockReturnValue({
          id: 1,
          name: 'Test District',
          statusId: 1,
          streetAddress1: '789 District Ave',
          city: 'District City',
          state: 'DC',
          zipCode: '67890',
          phone: '555-9876',
          email: 'district@example.com'
        })
      } as any;

      mockUserRepository.getUserDetails.mockResolvedValue(mockSuperAdminUser);
      mockCooperativeRepository.findById.mockResolvedValue(null);
      mockDistrictRepository.findByIds.mockResolvedValue(mockDistrict);
      mockDistrictRepository.updateWithTransaction.mockResolvedValue(mockDistrict);
      mockDatabaseService.runInTransaction.mockImplementation(async (callback) => {
        const mockPrisma = {} as any;
        return await callback(mockPrisma);
      });

      const result = await organizationService.updateOrganization(1, updateData, 1);

      expect(result).toEqual({ message: 'Organization updated successfully' });
      expect(mockDatabaseService.runInTransaction).toHaveBeenCalled();
      expect(mockDistrictRepository.updateWithTransaction).toHaveBeenCalled();
    });
  });
});

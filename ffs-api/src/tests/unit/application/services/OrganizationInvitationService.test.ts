import { OrganizationInvitationService } from '../../../../application/services/OrganizationInvitationService';
import { IInvitationRepository } from '../../../../domain/interfaces/invitations/IInvitationRepository';
import { IUserRepository } from '../../../../domain/interfaces/users/IUserRepository';
import { ICooperativeRepository } from '../../../../domain/interfaces/Cooperatives/ICooperativeRepository';
import { IDistrictRepository } from '../../../../domain/interfaces/Districts/IDistrictRepository';
import { IRoleRepository } from '../../../../domain/interfaces/roles/IRoleRepository';
import { IUserRoleRepository } from '../../../../domain/interfaces/userRoles/IUserRoleRepository';
import { IEmailService } from '../../../../application/contracts/IEmailService';
import { IDatabaseService } from '../../../../application/contracts/IDatabaseService';
import { Invitation } from '../../../../domain/interfaces/invitations/Invitation';
import { Role } from '../../../../domain/interfaces/roles/Role';
import { User } from '../../../../domain/interfaces/users/User';
import { UserRole } from '../../../../domain/interfaces/userRoles/UserRole';
import { Cooperative } from '../../../../domain/interfaces/Cooperatives/Cooperative';
import { InvitationStatusEnum } from '../../../../domain/constants/InvitationStatusEnum';
import { BadRequestError } from '../../../../domain/core/errors/BadRequestError';
import { NotFoundError } from '../../../../domain/core/errors/NotFoundError';

describe('OrganizationInvitationService', () => {
  let organizationInvitationService: OrganizationInvitationService;
  let invitationRepositoryMock: jest.Mocked<IInvitationRepository>;
  let userRepositoryMock: jest.Mocked<IUserRepository>;

  let roleRepositoryMock: jest.Mocked<IRoleRepository>;
  let userRoleRepositoryMock: jest.Mocked<IUserRoleRepository>;
  let emailServiceMock: jest.Mocked<IEmailService>;
  let databaseServiceMock: jest.Mocked<IDatabaseService>;

  const mockPrismaClient: {
    $transaction: jest.Mock;
    scope: { create: jest.Mock };
    organization: { update: jest.Mock };
  } = {
    $transaction: jest.fn((callback) => callback(mockPrismaClient)),
    scope: {
      create: jest.fn(),
    },
    organization: {
      update: jest.fn(),
    },
  };

  beforeEach(() => {
    invitationRepositoryMock = {
      findByToken: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<IInvitationRepository>;

    userRepositoryMock = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    } as unknown as jest.Mocked<IUserRepository>;



    roleRepositoryMock = {
      findByName: jest.fn(),
    } as unknown as jest.Mocked<IRoleRepository>;

    userRoleRepositoryMock = {
      create: jest.fn(),
    } as unknown as jest.Mocked<IUserRoleRepository>;

    emailServiceMock = {
      sendOrganizationInvitationAcceptedEmail: jest.fn(),
    } as unknown as jest.Mocked<IEmailService>;

    databaseServiceMock = {
      getClient: jest.fn().mockReturnValue(mockPrismaClient)
    } as unknown as jest.Mocked<IDatabaseService>;

    const cooperativeRepositoryMock = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<ICooperativeRepository>;
    
    const districtRepositoryMock = {
      findByIds: jest.fn(),
    } as unknown as jest.Mocked<IDistrictRepository>;

    organizationInvitationService = new OrganizationInvitationService(
      invitationRepositoryMock,
      userRepositoryMock,
      cooperativeRepositoryMock,
      districtRepositoryMock,
      roleRepositoryMock,
      userRoleRepositoryMock,
      emailServiceMock,
      databaseServiceMock
    );
  });

  describe('acceptInvitation', () => {
    const validEmail = 'test@example.com';
    const validPassword = 'password123';
    const validFirstName = 'John';
    const validLastName = 'Doe';
    const validToken = 'valid-token';
    const organizationId = 1;
    const userId = 1;
    const roleId = 2;
    const scopeId = 3;

    const mockInvitation = new Invitation({
      id: 1,
      email: validEmail,
      invitedBy: 1,
      statusId: InvitationStatusEnum.PENDING,
      token: validToken,
      createdAt: new Date(),
      expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days in the future
      cooperativeId: organizationId,
    });

    const mockRole = new Role({
      id: roleId,
      name: 'Group Admin',
      categoryId: 1,
    });

    const mockUser = new User({
      id: userId,
      email: validEmail,
      firstName: validFirstName,
      lastName: validLastName,
      passwordHash: 'hashed-password',
      statusId: 1,
      userStatus: { id: 1, name: 'Active' },
      emailVerified: true,
      isDeleted: false,
      demoAccount: false,
    });

    const mockScope = {
      id: scopeId,
      typeId: 1,
      name: 'Test Organization',
      scopeType: {
        id: 1,
        name: 'Organization',
      },
    };

    it('should successfully accept an invitation and register a user', async () => {
      const mockCooperative = new Cooperative({
        id: organizationId,
        code: 'COOP-001',
        name: 'Test Organization',
        organizationTypeId: 1,
        userStatusId: 1,
        createdAt: new Date(),
      });
      
      invitationRepositoryMock.findByToken.mockResolvedValue(mockInvitation);
      userRepositoryMock.findByEmail.mockResolvedValue(null);
      (organizationInvitationService as unknown as { cooperativeRepository: jest.Mocked<ICooperativeRepository> }).cooperativeRepository.findById.mockResolvedValue(mockCooperative);
      roleRepositoryMock.findByName.mockResolvedValue(mockRole);
      userRepositoryMock.create.mockResolvedValue(mockUser);
      mockPrismaClient.scope.create.mockResolvedValue(mockScope);
      userRoleRepositoryMock.create.mockResolvedValue({
        id: 1,
        userId,
        roleId,
        scopeId,
      } as unknown as UserRole);
      invitationRepositoryMock.update.mockResolvedValue(mockInvitation);
      emailServiceMock.sendOrganizationInvitationAcceptedEmail.mockResolvedValue();

      const result = await organizationInvitationService.acceptInvitation(
        validEmail,
        validPassword,
        validFirstName,
        validLastName,
        validToken
      );

      expect(invitationRepositoryMock.findByToken).toHaveBeenCalledWith(validToken);
      expect(userRepositoryMock.findByEmail).toHaveBeenCalledWith(validEmail);
      expect(roleRepositoryMock.findByName).toHaveBeenCalledWith('Group Admin');
      expect(userRepositoryMock.create).toHaveBeenCalled();
      expect(mockPrismaClient.scope.create).toHaveBeenCalled();
      expect(userRoleRepositoryMock.create).toHaveBeenCalled();
      expect(invitationRepositoryMock.update).toHaveBeenCalled();
      expect(emailServiceMock.sendOrganizationInvitationAcceptedEmail).toHaveBeenCalledWith(
        validEmail,
        validFirstName,
        mockCooperative.name
      );
      expect(result).toEqual({
        message: 'Organization invitation accepted and user successfully registered',
        user_id: userId,
        organization_id: organizationId,
      });
    });

    it('should throw NotFoundError if invitation not found', async () => {
      invitationRepositoryMock.findByToken.mockResolvedValue(null);

      await expect(
        organizationInvitationService.acceptInvitation(
          validEmail,
          validPassword,
          validFirstName,
          validLastName,
          validToken
        )
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw BadRequestError if invitation is not pending', async () => {
      const expiredInvitation = new Invitation({
        ...mockInvitation,
        statusId: InvitationStatusEnum.ACCEPTED,
      });
      invitationRepositoryMock.findByToken.mockResolvedValue(expiredInvitation);

      await expect(
        organizationInvitationService.acceptInvitation(
          validEmail,
          validPassword,
          validFirstName,
          validLastName,
          validToken
        )
      ).rejects.toThrow(BadRequestError);
    });

    it('should throw BadRequestError if invitation is expired', async () => {
      const expiredInvitation = new Invitation({
        ...mockInvitation,
        expirationDate: new Date(Date.now() - 1000), // Expired
      });
      invitationRepositoryMock.findByToken.mockResolvedValue(expiredInvitation);

      await expect(
        organizationInvitationService.acceptInvitation(
          validEmail,
          validPassword,
          validFirstName,
          validLastName,
          validToken
        )
      ).rejects.toThrow(BadRequestError);
    });

    it('should throw BadRequestError if email does not match invitation', async () => {
      invitationRepositoryMock.findByToken.mockResolvedValue(mockInvitation);

      await expect(
        organizationInvitationService.acceptInvitation(
          'different@example.com',
          validPassword,
          validFirstName,
          validLastName,
          validToken
        )
      ).rejects.toThrow(BadRequestError);
    });

    it('should throw NotFoundError if organization not found', async () => {
      const pendingInvitation = new Invitation({
        ...mockInvitation,
        statusId: InvitationStatusEnum.PENDING,
        cooperativeId: organizationId,
      });
      invitationRepositoryMock.findByToken.mockResolvedValue(pendingInvitation);
      (organizationInvitationService as unknown as { cooperativeRepository: jest.Mocked<ICooperativeRepository> }).cooperativeRepository.findById.mockResolvedValue(null);

      await expect(
        organizationInvitationService.acceptInvitation(
          validEmail,
          validPassword,
          validFirstName,
          validLastName,
          validToken
        )
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw BadRequestError if user already exists', async () => {
      const mockCooperative = new Cooperative({
        id: organizationId,
        code: 'COOP-001',
        name: 'Test Organization',
        organizationTypeId: 1,
        userStatusId: 1,
        createdAt: new Date(),
      });
      
      invitationRepositoryMock.findByToken.mockResolvedValue(mockInvitation);
      (organizationInvitationService as unknown as { cooperativeRepository: jest.Mocked<ICooperativeRepository> }).cooperativeRepository.findById.mockResolvedValue(mockCooperative);
      userRepositoryMock.findByEmail.mockResolvedValue(mockUser);

      await expect(
        organizationInvitationService.acceptInvitation(
          validEmail,
          validPassword,
          validFirstName,
          validLastName,
          validToken
        )
      ).rejects.toThrow(BadRequestError);
    });

    it('should throw NotFoundError if role not found', async () => {
      const pendingInvitation = new Invitation({
        ...mockInvitation,
        statusId: InvitationStatusEnum.PENDING,
        cooperativeId: organizationId,
      });
      const mockCooperative = new Cooperative({
        id: organizationId,
        code: 'COOP-001',
        name: 'Test Organization',
        organizationTypeId: 1,
        userStatusId: 1,
        createdAt: new Date(),
      });
      
      invitationRepositoryMock.findByToken.mockResolvedValue(pendingInvitation);
      (organizationInvitationService as unknown as { cooperativeRepository: jest.Mocked<ICooperativeRepository> }).cooperativeRepository.findById.mockResolvedValue(mockCooperative);
      userRepositoryMock.findByEmail.mockResolvedValue(null);
      roleRepositoryMock.findByName.mockResolvedValue(null);

      await expect(
        organizationInvitationService.acceptInvitation(
          validEmail,
          validPassword,
          validFirstName,
          validLastName,
          validToken
        )
      ).rejects.toThrow(NotFoundError);
    });


  });
});

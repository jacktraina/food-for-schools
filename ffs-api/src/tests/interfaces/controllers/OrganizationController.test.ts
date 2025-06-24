import { OrganizationController } from '../../../interfaces/controllers/OrganizationController';
import { IOrganizationService } from '../../../application/contracts/IOrganizationService';
import { IOrganizationInvitationService } from '../../../application/contracts/IOrganizationInvitationService';
import { Response } from 'express';
import { ForbiddenError } from '../../../domain/core/errors/ForbiddenError';
import { AuthRequest } from '../../../interfaces/responses/base/AuthRequest';

describe('OrganizationController', () => {
  let organizationController: OrganizationController;
  let organizationServiceMock: jest.Mocked<IOrganizationService>;
  let organizationInvitationServiceMock: jest.Mocked<IOrganizationInvitationService>;
  let req: Partial<AuthRequest>;
  let res: Partial<Response>;

  beforeEach(() => {
    organizationServiceMock = {
      inviteOrganization: jest.fn(),
    } as unknown as jest.Mocked<IOrganizationService>;

    organizationInvitationServiceMock = {
      acceptInvitation: jest.fn(),
    } as unknown as jest.Mocked<IOrganizationInvitationService>;

    organizationController = new OrganizationController(
      organizationServiceMock,
      organizationInvitationServiceMock
    );

    req = {
      body: {
        email: 'test@example.com',
        organization_type: 'Coop',
        name: 'Test Organization'
      },
      user: {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        cooperativeId: null,
        districtId: 1,
        roles: [
          {
            id: 1,
            type: 'Group Admin',
            scope: { id: 1, type: 'District' },
            permissions: []
          }
        ],
        bidRoles: [],
        manageBids: [],
        status: 'Active',
        lastLogin: new Date(),
        demoAccount: false,
        firstName: 'Test',
        lastName: 'User'
      }
    } as unknown as AuthRequest;

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('inviteOrganization', () => {
    it('should throw ForbiddenError if user is not authenticated', async () => {
      const reqWithoutUser = { ...req, user: undefined };

      await expect(
        organizationController['inviteOrganization'](reqWithoutUser as unknown as AuthRequest, res as Response)
      ).rejects.toThrow(ForbiddenError);
    });

    it('should call organizationService.inviteOrganization with correct parameters', async () => {
      organizationServiceMock.inviteOrganization.mockResolvedValue({ message: 'Organization invitation sent' });

      await organizationController['inviteOrganization'](req as AuthRequest, res as Response);

      expect(organizationServiceMock.inviteOrganization).toHaveBeenCalledWith({
        email: 'test@example.com',
        organization_type: 'Coop',
        name: 'Test Organization'
      }, 1);
    });

    it('should return 201 status with success message', async () => {
      organizationServiceMock.inviteOrganization.mockResolvedValue({ message: 'Organization invitation sent' });

      await organizationController['inviteOrganization'](req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'Organization invitation sent' });
    });

    it('should trim and lowercase email', async () => {
      req.body.email = '  Test@Example.com  ';
      organizationServiceMock.inviteOrganization.mockResolvedValue({ message: 'Organization invitation sent' });

      await organizationController['inviteOrganization'](req as AuthRequest, res as Response);

      expect(organizationServiceMock.inviteOrganization).toHaveBeenCalledWith({
        email: 'test@example.com',
        organization_type: 'Coop',
        name: 'Test Organization'
      }, 1);
    });
  });
});

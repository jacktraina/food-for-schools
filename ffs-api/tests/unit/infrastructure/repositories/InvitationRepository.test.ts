import { InvitationRepository } from '../../../../src/infrastructure/repositories/InvitationRepository';
import { IDatabaseService } from '../../../../src/application/contracts/IDatabaseService';
import { Invitation } from '../../../../src/domain/interfaces/invitations/Invitation';

describe('InvitationRepository', () => {
  let invitationRepository: InvitationRepository;
  let mockDatabaseService: jest.Mocked<IDatabaseService>;
  let mockPrismaClient: any;

  beforeEach(() => {
    mockPrismaClient = {
      invitation: {
        create: jest.fn().mockImplementation(data => Promise.resolve(data.data)),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn().mockImplementation(data => Promise.resolve({ ...data.where, ...data.data })),
      },
    };

    mockDatabaseService = {
      getClient: jest.fn().mockReturnValue(mockPrismaClient),
    } as unknown as jest.Mocked<IDatabaseService>;

    invitationRepository = new InvitationRepository(mockDatabaseService);
  });

  describe('create', () => {
    it('should create an invitation', async () => {
      const invitation = new Invitation({
        id: 0,
        email: 'test@example.com',
        districtId: 1,
        invitedBy: 1,
        statusId: 1,
        expirationDate: new Date(),
      });

      const createdInvitationData = {
        id: 1,
        email: 'test@example.com',
        districtId: 1,
        cooperativeId: null,
        invitedBy: 1,
        statusId: 1,
        createdAt: new Date(),
        expirationDate: new Date(),
        invitedRoleId: null,
      };

      mockPrismaClient.invitation.create.mockResolvedValueOnce(createdInvitationData);

      const result = await invitationRepository.create(invitation);

      expect(mockPrismaClient.invitation.create).toHaveBeenCalledWith({
        data: {
          email: invitation.email,
          districtId: invitation.districtId,
          cooperativeId: invitation.cooperativeId,
          invitedBy: invitation.invitedBy,
          statusId: invitation.statusId,
          expirationDate: invitation.expirationDate,
          invitedRoleId: invitation.invitedRoleId,
          token: invitation.token,
        },
      });
      expect(result).toBeInstanceOf(Invitation);
      expect(result.id).toBe(1);
      expect(result.email).toBe('test@example.com');
    });
  });

  describe('findByEmail', () => {
    it('should return invitation when found', async () => {
      const email = 'test@example.com';
      const invitationData = {
        id: 1,
        email,
        districtId: 1,
        cooperativeId: null,
        invitedBy: 1,
        statusId: 1,
        createdAt: new Date(),
        expirationDate: new Date(),
        invitedRoleId: null,
      };

      mockPrismaClient.invitation.findFirst.mockResolvedValueOnce(invitationData);

      const result = await invitationRepository.findByEmail(email);

      expect(mockPrismaClient.invitation.findFirst).toHaveBeenCalledWith({
        where: { email },
      });
      expect(result).toBeInstanceOf(Invitation);
      expect(result?.id).toBe(1);
      expect(result?.email).toBe(email);
    });

    it('should return null when invitation not found', async () => {
      const email = 'nonexistent@example.com';
      mockPrismaClient.invitation.findFirst.mockResolvedValueOnce(null);

      const result = await invitationRepository.findByEmail(email);

      expect(mockPrismaClient.invitation.findFirst).toHaveBeenCalledWith({
        where: { email },
      });
      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return invitation when found', async () => {
      const id = 1;
      const invitationData = {
        id,
        email: 'test@example.com',
        districtId: 1,
        cooperativeId: null,
        invitedBy: 1,
        statusId: 1,
        createdAt: new Date(),
        expirationDate: new Date(),
        invitedRoleId: null,
      };

      mockPrismaClient.invitation.findUnique.mockResolvedValueOnce(invitationData);

      const result = await invitationRepository.findById(id);

      expect(mockPrismaClient.invitation.findUnique).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toBeInstanceOf(Invitation);
      expect(result?.id).toBe(id);
    });

    it('should return null when invitation not found', async () => {
      const id = 999;
      mockPrismaClient.invitation.findUnique.mockResolvedValueOnce(null);

      const result = await invitationRepository.findById(id);

      expect(mockPrismaClient.invitation.findUnique).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update an invitation', async () => {
      const invitation = new Invitation({
        id: 1,
        email: 'test@example.com',
        districtId: 1,
        invitedBy: 1,
        statusId: 2, // Updated status
        expirationDate: new Date(),
      });

      const updatedInvitationData = {
        id: 1,
        email: 'test@example.com',
        districtId: 1,
        cooperativeId: null,
        invitedBy: 1,
        statusId: 2,
        createdAt: new Date(),
        expirationDate: new Date(),
        invitedRoleId: null,
      };

      mockPrismaClient.invitation.update.mockResolvedValueOnce(updatedInvitationData);

      const result = await invitationRepository.update(invitation);

      expect(mockPrismaClient.invitation.update).toHaveBeenCalledWith({
        where: { id: invitation.id },
        data: {
          email: invitation.email,
          invitedBy: invitation.invitedBy,
          statusId: invitation.statusId,
          expirationDate: invitation.expirationDate,
          invitedRoleId: invitation.invitedRoleId,
          token: invitation.token,
        },
      });
      expect(result).toBeInstanceOf(Invitation);
      expect(result.id).toBe(1);
      expect(result.statusId).toBe(2);
    });
  });
});
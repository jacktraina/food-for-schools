import { UserService } from '../../../../src/application/services/UserService';
import { User } from '../../../../src/domain/interfaces/users/User';
import { BulkUpload } from '../../../../src/domain/interfaces/bulkUploads/BulkUpload';
import { BadRequestError } from '../../../../src/domain/core/errors/BadRequestError';
import { ForbiddenError } from '../../../../src/domain/core/errors/ForbiddenError';

describe('UserService - bulkUploadUsers', () => {
  let userService: UserService;
  let mockUserRepository: any;
  let mockRoleRepository: any;
  let mockPasswordResetCodeRepository: any;
  let mockEmailService: any;
  let mockEmailTemplates: any;
  let mockInvitationRepository: any;
  let mockBulkUploadRepository: any;
  
  const testUser = new User({
    id: 1,
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    userStatus: { id: 1, name: 'Active' } as any,
    statusId: 1,
    districtId: 1,
    isDeleted: false,
    passwordHash: 'hash',
    emailVerified: true,
    demoAccount: false
  });
  
  const mockFile = {
    originalname: 'test.csv',
    buffer: Buffer.from('email,full_name,role,bid_role,district_id,school_id\nuser1@example.com,User One,District Admin,Bid Administrator,1,1'),
    mimetype: 'text/csv'
  } as Express.Multer.File;
  
  beforeEach(() => {
    mockUserRepository = {
      getUserById: jest.fn().mockResolvedValue(testUser),
      getUserByEmail: jest.fn().mockResolvedValue(null)
    };
    
    mockRoleRepository = {
      getRoleByName: jest.fn().mockResolvedValue({ id: 1, name: 'District Admin' })
    };
    
    mockPasswordResetCodeRepository = {};
    
    mockEmailService = {
      sendEmail: jest.fn().mockResolvedValue(true)
    };
    
    const mockOneSignalService = {
      sendEmail: jest.fn().mockResolvedValue(true),
      sendPushNotification: jest.fn().mockResolvedValue(true)
    };
    
    mockEmailTemplates = {
      getInvitationEmail: jest.fn().mockReturnValue({
        subject: 'Invitation',
        html: '<p>You are invited</p>'
      })
    };
    
    mockInvitationRepository = {
      createInvitation: jest.fn().mockResolvedValue({ id: 1 })
    };
    
    mockBulkUploadRepository = {
      create: jest.fn().mockImplementation((bulkUpload) => {
        const created = new BulkUpload({
          ...bulkUpload,
          id: 1
        });
        return Promise.resolve(created);
      }),
      update: jest.fn().mockImplementation((bulkUpload) => {
        return Promise.resolve(bulkUpload);
      })
    };
    
    userService = new UserService(
      mockUserRepository,
      mockRoleRepository,
      mockEmailService,
      mockOneSignalService,
      mockEmailTemplates,
      mockPasswordResetCodeRepository,
      mockInvitationRepository,
      mockBulkUploadRepository
    );
    
    userService.inviteUser = jest.fn().mockResolvedValue(undefined);
    
    userService.getUserById = jest.fn().mockResolvedValue({
      ...testUser,
      getAdminRoles: jest.fn().mockReturnValue([
        { role: { name: 'District Admin' } }
      ])
    });
  });
  
  it('should process a valid CSV file and create invitations', async () => {
    const result = await userService.bulkUploadUsers(mockFile, 1);
    
    expect(mockBulkUploadRepository.create).toHaveBeenCalled();
    expect(userService.inviteUser).toHaveBeenCalled();
    expect(mockBulkUploadRepository.update).toHaveBeenCalled();
    expect(result).toHaveProperty('message');
    expect(result.message).toContain('Bulk upload completed');
  });
  
  it('should throw BadRequestError if file is not a CSV', async () => {
    const invalidFile = {
      ...mockFile,
      mimetype: 'application/pdf'
    } as Express.Multer.File;
    
    await expect(userService.bulkUploadUsers(invalidFile, 1))
      .rejects.toThrow(BadRequestError);
  });
  
  it('should throw BadRequestError if CSV is missing required columns', async () => {
    const invalidCsvFile = {
      ...mockFile,
      buffer: Buffer.from('email,full_name,role\nuser1@example.com,User One,District Admin')
    } as Express.Multer.File;
    
    await expect(userService.bulkUploadUsers(invalidCsvFile, 1))
      .rejects.toThrow(BadRequestError);
  });
  
  it('should track failed invitations', async () => {
    (userService.inviteUser as jest.Mock).mockRejectedValueOnce(new Error('Test error'));
    
    const result = await userService.bulkUploadUsers(mockFile, 1);
    
    expect(mockBulkUploadRepository.update).toHaveBeenCalled();
    expect(result.message).toContain('failed');
  });
});

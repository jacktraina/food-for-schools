import { BulkUploadRepository } from '../../../../src/infrastructure/repositories/BulkUploadRepository';
import { BulkUpload } from '../../../../src/domain/interfaces/bulkUploads/BulkUpload';

describe('BulkUploadRepository', () => {
  let repository: BulkUploadRepository;
  let mockDatabaseService: any;
  let mockPrismaClient: any;

  beforeEach(() => {
    mockPrismaClient = {
      bulkUserUpload: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    mockDatabaseService = {
      getClient: jest.fn().mockReturnValue(mockPrismaClient),
      connect: jest.fn(),
      disconnect: jest.fn(),
      runInTransaction: jest.fn(),
    };
    
    repository = new BulkUploadRepository(mockDatabaseService);
  });

  describe('create', () => {
    it('should create a new bulk upload', async () => {
      const mockBulkUploadData = {
        id: 1,
        fileName: 'users.csv',
        uploadedBy: 1,
        status: 'PENDING',
        totalRows: 100,
        processedRows: 0,
        failedRows: 0,
        errorDetails: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const bulkUpload = new BulkUpload(mockBulkUploadData);

      mockPrismaClient.bulkUserUpload.create.mockResolvedValue(mockBulkUploadData);

      const result = await repository.create(bulkUpload);

      expect(mockPrismaClient.bulkUserUpload.create).toHaveBeenCalledWith({
        data: {
          fileName: bulkUpload.fileName,
          uploadedBy: bulkUpload.uploadedBy,
          status: bulkUpload.status,
          totalRows: bulkUpload.totalRows,
          processedRows: bulkUpload.processedRows,
          failedRows: bulkUpload.failedRows,
          errorDetails: bulkUpload.errorDetails,
        },
      });
      expect(result).toBeInstanceOf(BulkUpload);
    });
  });

  describe('findById', () => {
    it('should return a bulk upload when found', async () => {
      const mockBulkUpload = {
        id: 1,
        fileName: 'users.csv',
        uploadedBy: 1,
        status: 'COMPLETED',
        totalRows: 100,
        processedRows: 100,
        failedRows: 5,
        errorDetails: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaClient.bulkUserUpload.findUnique.mockResolvedValue(mockBulkUpload);

      const result = await repository.findById(1);

      expect(mockPrismaClient.bulkUserUpload.findUnique).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
      });
      expect(result).toBeInstanceOf(BulkUpload);
    });

    it('should return null when bulk upload not found', async () => {
      mockPrismaClient.bulkUserUpload.findUnique.mockResolvedValue(null);

      const result = await repository.findById(999);

      expect(result).toBeNull();
    });
  });
});

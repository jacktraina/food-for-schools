import { BulkUpload } from '../../../../../src/domain/interfaces/bulkUploads/BulkUpload';

describe('BulkUpload', () => {
  describe('constructor', () => {
    it('should create a bulk upload with valid data', () => {
      const bulkUploadData = {
        id: 1,
        fileName: 'users.csv',
        uploadedBy: 1,
        status: 'PENDING',
        totalRows: 100,
        processedRows: 0,
        failedRows: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const bulkUpload = new BulkUpload(bulkUploadData);

      expect(bulkUpload.id).toBe(bulkUploadData.id);
      expect(bulkUpload.fileName).toBe(bulkUploadData.fileName);
      expect(bulkUpload.uploadedBy).toBe(bulkUploadData.uploadedBy);
      expect(bulkUpload.status).toBe(bulkUploadData.status);
      expect(bulkUpload.totalRows).toBe(bulkUploadData.totalRows);
      expect(bulkUpload.processedRows).toBe(bulkUploadData.processedRows);
      expect(bulkUpload.failedRows).toBe(bulkUploadData.failedRows);
    });
  });

  describe('markAsProcessing', () => {
    it('should set status to Processing', () => {
      const bulkUploadData = {
        id: 1,
        fileName: 'users.csv',
        uploadedBy: 1,
        status: 'PENDING',
      };

      const bulkUpload = new BulkUpload(bulkUploadData);
      bulkUpload.markAsProcessing();

      expect(bulkUpload.status).toBe('Processing');
    });
  });

  describe('markAsCompleted', () => {
    it('should set status to Completed and update counts', () => {
      const bulkUploadData = {
        id: 1,
        fileName: 'users.csv',
        uploadedBy: 1,
        status: 'Processing',
      };

      const bulkUpload = new BulkUpload(bulkUploadData);
      bulkUpload.markAsCompleted(95, 5);

      expect(bulkUpload.status).toBe('Completed');
      expect(bulkUpload.processedRows).toBe(95);
      expect(bulkUpload.failedRows).toBe(5);
    });
  });

  describe('markAsFailed', () => {
    it('should set status to Failed and set error details', () => {
      const bulkUploadData = {
        id: 1,
        fileName: 'users.csv',
        uploadedBy: 1,
        status: 'Processing',
      };

      const bulkUpload = new BulkUpload(bulkUploadData);
      bulkUpload.markAsFailed('File format error');

      expect(bulkUpload.status).toBe('Failed');
      expect(bulkUpload.errorDetails).toBe('File format error');
    });
  });
});

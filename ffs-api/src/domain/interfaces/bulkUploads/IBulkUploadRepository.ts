import { BulkUpload } from './BulkUpload';

export interface IBulkUploadRepository {
  create(bulkUpload: BulkUpload): Promise<BulkUpload>;
  update(bulkUpload: BulkUpload): Promise<BulkUpload>;
  findById(id: number): Promise<BulkUpload | null>;
}

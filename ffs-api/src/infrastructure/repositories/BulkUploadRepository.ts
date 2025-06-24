import { inject, injectable } from 'inversify';
import { PrismaClient } from '@prisma/client';
import { IBulkUploadRepository } from '../../domain/interfaces/bulkUploads/IBulkUploadRepository';
import { BulkUpload } from '../../domain/interfaces/bulkUploads/BulkUpload';
import TYPES from '../../shared/dependencyInjection/types';
import { IDatabaseService } from '../../application/contracts/IDatabaseService';

@injectable()
export class BulkUploadRepository implements IBulkUploadRepository {
  private prisma: PrismaClient;

  constructor(
    @inject(TYPES.IDatabaseService) private databaseService: IDatabaseService
  ) {
    this.prisma = databaseService.getClient();
  }

  async create(bulkUpload: BulkUpload): Promise<BulkUpload> {
    const created = await this.prisma.bulkUserUpload.create({
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

    return new BulkUpload({
      id: created.id,
      fileName: created.fileName,
      uploadedBy: created.uploadedBy,
      status: created.status,
      totalRows: created.totalRows ?? undefined,
      processedRows: created.processedRows ?? undefined,
      failedRows: created.failedRows ?? undefined,
      errorDetails: created.errorDetails ?? undefined,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    });
  }

  async update(bulkUpload: BulkUpload): Promise<BulkUpload> {
    const updated = await this.prisma.bulkUserUpload.update({
      where: { id: bulkUpload.id },
      data: {
        status: bulkUpload.status,
        totalRows: bulkUpload.totalRows,
        processedRows: bulkUpload.processedRows,
        failedRows: bulkUpload.failedRows,
        errorDetails: bulkUpload.errorDetails,
      },
    });

    return new BulkUpload({
      id: updated.id,
      fileName: updated.fileName,
      uploadedBy: updated.uploadedBy,
      status: updated.status,
      totalRows: updated.totalRows ?? undefined,
      processedRows: updated.processedRows ?? undefined,
      failedRows: updated.failedRows ?? undefined,
      errorDetails: updated.errorDetails ?? undefined,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    });
  }

  async findById(id: number): Promise<BulkUpload | null> {
    const found = await this.prisma.bulkUserUpload.findUnique({
      where: { id },
    });

    if (!found) return null;

    return new BulkUpload({
      id: found.id,
      fileName: found.fileName,
      uploadedBy: found.uploadedBy,
      status: found.status,
      totalRows: found.totalRows ?? undefined,
      processedRows: found.processedRows ?? undefined,
      failedRows: found.failedRows ?? undefined,
      errorDetails: found.errorDetails ?? undefined,
      createdAt: found.createdAt,
      updatedAt: found.updatedAt,
    });
  }
}

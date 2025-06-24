export interface IBulkUploadProps {
  id: number;
  fileName: string;
  uploadedBy: number;
  status: string;
  totalRows?: number;
  processedRows?: number;
  failedRows?: number;
  errorDetails?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class BulkUpload {
  id: number;
  fileName: string;
  uploadedBy: number;
  status: string;
  totalRows?: number;
  processedRows?: number;
  failedRows?: number;
  errorDetails?: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(props: IBulkUploadProps) {
    this.id = props.id;
    this.fileName = props.fileName;
    this.uploadedBy = props.uploadedBy;
    this.status = props.status;
    this.totalRows = props.totalRows;
    this.processedRows = props.processedRows;
    this.failedRows = props.failedRows;
    this.errorDetails = props.errorDetails;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  markAsProcessing(): void {
    this.status = 'Processing';
  }

  markAsCompleted(processed: number, failed: number): void {
    this.status = 'Completed';
    this.processedRows = processed;
    this.failedRows = failed;
  }

  markAsFailed(error: string): void {
    this.status = 'Failed';
    this.errorDetails = error;
  }
}

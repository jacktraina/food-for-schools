import { z } from 'zod';

export const BulkUploadRequestSchema = z.object({
  file: z.any().refine((file) => file instanceof Object && file.mimetype === 'text/csv', {
    message: 'File must be a CSV'
  })
});

export type BulkUploadRequest = z.infer<typeof BulkUploadRequestSchema>;

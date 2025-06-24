import { z } from 'zod';

export const UpdateCategoryRequestSchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().min(1, 'Description is required')
});

export interface UpdateCategoryRequest {
  name: string;
  description: string;
}

export type UpdateCategoryRequestBody = z.infer<typeof UpdateCategoryRequestSchema>;

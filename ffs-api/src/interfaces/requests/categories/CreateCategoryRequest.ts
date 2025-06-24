import { z } from 'zod';

export const CreateCategoryRequestSchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().min(1, 'Description is required')
});

export interface CreateCategoryRequest {
  name: string;
  description: string;
}

export type CreateCategoryRequestBody = z.infer<typeof CreateCategoryRequestSchema>;

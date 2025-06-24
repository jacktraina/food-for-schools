import { z } from 'zod';

export const SearchUsersRequestSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    role: z.string().optional(),
    bidRole: z.string().optional(),
    status: z.string().optional(),
    district: z.string().optional()
  }).optional(),
  params: z.object({}).optional(),
  body: z.object({}).optional()
});

export type SearchUsersRequest = z.infer<typeof SearchUsersRequestSchema>;

export interface SearchFilters {
  search?: string;
  role?: string;
  bidRole?: string;
  status?: string;
  district?: string;
}

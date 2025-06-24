import { z } from 'zod';

export const CreateUserRequestSchema = z.object({
  email: z.string().email('Invalid email format'),
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string().min(1, 'Middle name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  roleId: z.number().min(0),
});

export type CreateUserRequest = z.infer<typeof CreateUserRequestSchema>;

import { z } from 'zod';
import { PatentStatus } from '../constants';

export const signInSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const verifyCodeSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  code: z.string().min(1, 'Code is required'),
});

export const createCompanySchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  entityId: z.number().optional(),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(50),
});

export const patentFilterSchema = z.object({
  companyId: z.coerce.number().int().optional(),
  search: z.string().optional(),
  status: z.nativeEnum(PatentStatus).optional(),
});

export type SignInInput = z.infer<typeof signInSchema>;
export type VerifyCodeInput = z.infer<typeof verifyCodeSchema>;
export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type PatentFilterInput = z.infer<typeof patentFilterSchema>;

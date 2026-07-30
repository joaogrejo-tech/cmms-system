import { z } from 'zod';
import { Role, Specialty } from '@prisma/client';

export const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres.'),
  role: z.nativeEnum(Role),
  specialty: z.nativeEnum(Specialty).optional(),
  sectorId: z.string().uuid().optional(),
  phone: z.string().optional(),
  registration: z.string().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.nativeEnum(Role).optional(),
  specialty: z.nativeEnum(Specialty).optional(),
  sectorId: z.string().uuid().optional(),
  phone: z.string().optional(),
  registration: z.string().optional(),
  avatarUrl: z.string().optional(),
  active: z.boolean().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6).optional(),
  newPassword: z.string().min(6, 'A nova senha deve ter no mínimo 6 caracteres.'),
});

export const listUsersQuerySchema = z.object({
  page: z.string().optional(),
  perPage: z.string().optional(),
  role: z.nativeEnum(Role).optional(),
  specialty: z.nativeEnum(Specialty).optional(),
  sectorId: z.string().uuid().optional(),
  active: z.enum(['true', 'false']).optional(),
  search: z.string().optional(),
});

export type CreateUserDTO = z.infer<typeof createUserSchema>;
export type UpdateUserDTO = z.infer<typeof updateUserSchema>;
export type ChangePasswordDTO = z.infer<typeof changePasswordSchema>;
export type ListUsersQueryDTO = z.infer<typeof listUsersQuerySchema>;

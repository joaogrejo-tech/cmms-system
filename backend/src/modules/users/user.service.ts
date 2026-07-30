import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import { prisma } from '@/config/prisma';
import { AppError, NotFoundError } from '@/shared/errors/AppError';
import { parsePagination, buildPaginatedResponse } from '@/shared/utils/pagination';
import { ChangePasswordDTO, CreateUserDTO, ListUsersQueryDTO, UpdateUserDTO } from './user.dto';

const publicSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  specialty: true,
  sectorId: true,
  sector: true,
  avatarUrl: true,
  phone: true,
  registration: true,
  active: true,
  lastLoginAt: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

export class UserService {
  async list(query: ListUsersQueryDTO) {
    const { skip, take, page, perPage } = parsePagination(query);

    const where: Prisma.UserWhereInput = {
      role: query.role,
      specialty: query.specialty,
      sectorId: query.sectorId,
      active: query.active ? query.active === 'true' : undefined,
      OR: query.search
        ? [
            { name: { contains: query.search, mode: 'insensitive' } },
            { email: { contains: query.search, mode: 'insensitive' } },
            { registration: { contains: query.search, mode: 'insensitive' } },
          ]
        : undefined,
    };

    const [items, total] = await Promise.all([
      prisma.user.findMany({ where, select: publicSelect, skip, take, orderBy: { name: 'asc' } }),
      prisma.user.count({ where }),
    ]);

    return buildPaginatedResponse(items, total, page, perPage);
  }

  async findById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        ...publicSelect,
        workOrdersAssigned: {
          select: { id: true, code: true, status: true, priority: true, openedAt: true },
          orderBy: { openedAt: 'desc' },
          take: 10,
        },
        _count: {
          select: { workOrdersAssigned: true, workOrdersRequested: true },
        },
      },
    });
    if (!user) throw new NotFoundError('Funcionário');
    return user;
  }

  async create(data: CreateUserDTO) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new AppError('Já existe um usuário cadastrado com este e-mail.', 409);

    const passwordHash = await bcrypt.hash(data.password, 10);

    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: data.role,
        specialty: data.specialty,
        sectorId: data.sectorId,
        phone: data.phone,
        registration: data.registration,
      },
      select: publicSelect,
    });
  }

  async update(id: string, data: UpdateUserDTO) {
    await this.ensureExists(id);
    return prisma.user.update({ where: { id }, data, select: publicSelect });
  }

  async changePassword(id: string, dto: ChangePasswordDTO, requesterIsAdmin: boolean) {
    const user = await this.ensureExists(id);

    if (!requesterIsAdmin) {
      if (!dto.currentPassword) {
        throw new AppError('Informe a senha atual.', 422);
      }
      const matches = await bcrypt.compare(dto.currentPassword, user.passwordHash);
      if (!matches) throw new AppError('Senha atual incorreta.', 401);
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await prisma.user.update({ where: { id }, data: { passwordHash } });
  }

  async delete(id: string) {
    await this.ensureExists(id);
    // Soft delete: usuários possuem histórico de OS, então nunca removemos fisicamente.
    await prisma.user.update({ where: { id }, data: { active: false } });
  }

  private async ensureExists(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundError('Funcionário');
    return user;
  }
}

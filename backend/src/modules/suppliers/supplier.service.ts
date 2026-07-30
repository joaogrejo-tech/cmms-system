import { Prisma } from '@prisma/client';
import { prisma } from '@/config/prisma';
import { NotFoundError } from '@/shared/errors/AppError';
import { parsePagination, buildPaginatedResponse } from '@/shared/utils/pagination';
import { CreateSupplierDTO, ListSuppliersQueryDTO, UpdateSupplierDTO } from './supplier.dto';

export class SupplierService {
  async list(query: ListSuppliersQueryDTO) {
    const { skip, take, page, perPage } = parsePagination(query);
    const where: Prisma.SupplierWhereInput = {
      active: true,
      OR: query.search
        ? [
            { name: { contains: query.search, mode: 'insensitive' } },
            { cnpj: { contains: query.search, mode: 'insensitive' } },
          ]
        : undefined,
    };

    const [items, total] = await Promise.all([
      prisma.supplier.findMany({ where, skip, take, orderBy: { name: 'asc' } }),
      prisma.supplier.count({ where }),
    ]);

    return buildPaginatedResponse(items, total, page, perPage);
  }

  async findById(id: string) {
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        parts: true,
        purchases: { orderBy: { requestedAt: 'desc' }, take: 10 },
      },
    });
    if (!supplier) throw new NotFoundError('Fornecedor');
    return supplier;
  }

  async create(data: CreateSupplierDTO) {
    return prisma.supplier.create({ data });
  }

  async update(id: string, data: UpdateSupplierDTO) {
    await this.ensureExists(id);
    return prisma.supplier.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.ensureExists(id);
    await prisma.supplier.update({ where: { id }, data: { active: false } });
  }

  private async ensureExists(id: string) {
    const supplier = await prisma.supplier.findUnique({ where: { id } });
    if (!supplier) throw new NotFoundError('Fornecedor');
    return supplier;
  }
}

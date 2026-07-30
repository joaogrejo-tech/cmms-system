import { Prisma } from '@prisma/client';
import { prisma } from '@/config/prisma';
import { AppError, NotFoundError } from '@/shared/errors/AppError';
import { parsePagination, buildPaginatedResponse } from '@/shared/utils/pagination';
import { CreatePartDTO, ListPartsQueryDTO, StockMovementDTO, UpdatePartDTO } from './inventory.dto';

export class InventoryService {
  async list(query: ListPartsQueryDTO) {
    const { skip, take, page, perPage } = parsePagination(query);

    const where: Prisma.PartWhereInput = {
      active: true,
      supplierId: query.supplierId,
      OR: query.search
        ? [
            { name: { contains: query.search, mode: 'insensitive' } },
            { code: { contains: query.search, mode: 'insensitive' } },
          ]
        : undefined,
    };

    const [items, total] = await Promise.all([
      prisma.part.findMany({ where, include: { supplier: true }, skip, take, orderBy: { name: 'asc' } }),
      prisma.part.count({ where }),
    ]);

    let data = items.map((p) => ({ ...p, belowMinimum: p.quantity.toNumber() <= p.minStock.toNumber() }));

    if (query.belowMinimum === 'true') {
      data = data.filter((p) => p.belowMinimum);
    }

    return buildPaginatedResponse(data, total, page, perPage);
  }

  async findById(id: string) {
    const part = await prisma.part.findUnique({
      where: { id },
      include: {
        supplier: true,
        movements: { orderBy: { createdAt: 'desc' }, take: 30 },
      },
    });
    if (!part) throw new NotFoundError('Peça');
    return part;
  }

  async create(data: CreatePartDTO) {
    return prisma.part.create({ data, include: { supplier: true } });
  }

  async update(id: string, data: UpdatePartDTO) {
    await this.ensureExists(id);
    return prisma.part.update({ where: { id }, data, include: { supplier: true } });
  }

  async delete(id: string) {
    await this.ensureExists(id);
    await prisma.part.update({ where: { id }, data: { active: false } });
  }

  async registerMovement(id: string, dto: StockMovementDTO, userId: string) {
    const part = await this.ensureExists(id);

    if ((dto.type === 'SAIDA') && part.quantity.toNumber() < dto.quantity) {
      throw new AppError('Quantidade insuficiente em estoque para esta saída.', 422);
    }

    const delta = dto.type === 'SAIDA' ? -dto.quantity : dto.quantity;

    const [, movement] = await prisma.$transaction([
      prisma.part.update({ where: { id }, data: { quantity: { increment: delta } } }),
      prisma.stockMovement.create({
        data: { partId: id, type: dto.type, quantity: dto.quantity, reason: dto.reason, createdById: userId },
      }),
    ]);

    return movement;
  }

  private async ensureExists(id: string) {
    const part = await prisma.part.findUnique({ where: { id } });
    if (!part) throw new NotFoundError('Peça');
    return part;
  }
}

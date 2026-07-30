import { Prisma } from '@prisma/client';
import { prisma } from '@/config/prisma';
import { NotFoundError } from '@/shared/errors/AppError';
import { parsePagination, buildPaginatedResponse } from '@/shared/utils/pagination';
import { CreateAssetDTO, ListAssetsQueryDTO, UpdateAssetDTO } from './asset.dto';

const ASSET_SORT_FIELDS = ['name', 'code', 'criticality', 'status', 'createdAt'];

export class AssetService {
  async list(query: ListAssetsQueryDTO) {
    const { skip, take, page, perPage, orderBy } = parsePagination(query, ASSET_SORT_FIELDS, 'name');

    const where: Prisma.AssetWhereInput = {
      sectorId: query.sectorId,
      criticality: query.criticality,
      status: query.status,
      active: true,
      OR: query.search
        ? [
            { name: { contains: query.search, mode: 'insensitive' } },
            { tag: { contains: query.search, mode: 'insensitive' } },
            { code: { contains: query.search, mode: 'insensitive' } },
          ]
        : undefined,
    };

    const [items, total] = await Promise.all([
      prisma.asset.findMany({
        where,
        include: { sector: true, _count: { select: { workOrders: true } } },
        skip,
        take,
        orderBy,
      }),
      prisma.asset.count({ where }),
    ]);

    return buildPaginatedResponse(items, total, page, perPage);
  }

  async findById(id: string) {
    const asset = await prisma.asset.findUnique({
      where: { id },
      include: {
        sector: true,
        childAssets: true,
        parentAsset: true,
        attachments: { orderBy: { createdAt: 'desc' } },
        meterReadings: { orderBy: { readAt: 'desc' }, take: 20 },
        workOrders: {
          orderBy: { openedAt: 'desc' },
          take: 20,
          include: { assignedTo: { select: { id: true, name: true } } },
        },
        preventivePlans: true,
      },
    });
    if (!asset) throw new NotFoundError('Ativo');
    return asset;
  }

  async create(data: CreateAssetDTO) {
    return prisma.asset.create({ data, include: { sector: true } });
  }

  async update(id: string, data: UpdateAssetDTO) {
    await this.ensureExists(id);
    return prisma.asset.update({ where: { id }, data, include: { sector: true } });
  }

  async delete(id: string) {
    await this.ensureExists(id);
    // Soft delete: ativos possuem histórico (OS, preventivas), então nunca removemos fisicamente.
    await prisma.asset.update({ where: { id }, data: { active: false, status: 'DESATIVADO' } });
  }

  async addMeterReading(id: string, value: number, unit: string) {
    await this.ensureExists(id);
    return prisma.assetMeterReading.create({ data: { assetId: id, value, unit } });
  }

  private async ensureExists(id: string) {
    const asset = await prisma.asset.findUnique({ where: { id } });
    if (!asset) throw new NotFoundError('Ativo');
    return asset;
  }
}

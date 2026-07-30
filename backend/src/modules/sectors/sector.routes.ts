import { z } from 'zod';
import { Request, Response, Router } from 'express';
import { prisma } from '@/config/prisma';
import { AppError, NotFoundError } from '@/shared/errors/AppError';
import { authenticate } from '@/middlewares/authenticate';
import { authorize } from '@/middlewares/authorize';

const createSectorSchema = z.object({
  name: z.string().min(2),
  costCenter: z.string().optional(),
  description: z.string().optional(),
});

const updateSectorSchema = createSectorSchema.partial();

class SectorService {
  async list() {
    return prisma.sector.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
      include: { _count: { select: { assets: true, workOrders: true, users: true } } },
    });
  }

  async findById(id: string) {
    const sector = await prisma.sector.findUnique({ where: { id } });
    if (!sector) throw new NotFoundError('Setor');
    return sector;
  }

  async create(data: z.infer<typeof createSectorSchema>) {
    const existing = await prisma.sector.findUnique({ where: { name: data.name } });
    if (existing) throw new AppError('Já existe um setor com este nome.', 409);
    return prisma.sector.create({ data });
  }

  async update(id: string, data: z.infer<typeof updateSectorSchema>) {
    await this.findById(id);
    return prisma.sector.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.findById(id);
    await prisma.sector.update({ where: { id }, data: { active: false } });
  }
}

const service = new SectorService();
const router = Router();

router.use(authenticate);

router.get('/', async (_req: Request, res: Response) => res.status(200).json(await service.list()));
router.get('/:id', async (req: Request, res: Response) => res.status(200).json(await service.findById(req.params.id)));
router.post('/', authorize('ADMIN', 'PCM'), async (req: Request, res: Response) => {
  const data = createSectorSchema.parse(req.body);
  return res.status(201).json(await service.create(data));
});
router.put('/:id', authorize('ADMIN', 'PCM'), async (req: Request, res: Response) => {
  const data = updateSectorSchema.parse(req.body);
  return res.status(200).json(await service.update(req.params.id, data));
});
router.delete('/:id', authorize('ADMIN'), async (req: Request, res: Response) => {
  await service.delete(req.params.id);
  return res.status(204).send();
});

export { router as sectorRoutes };

import { Request, Response } from 'express';
import { PreventiveService } from './preventive.service';
import { createPreventivePlanSchema, listPreventivePlansQuerySchema, updatePreventivePlanSchema } from './preventive.dto';

const service = new PreventiveService();

export class PreventiveController {
  async list(req: Request, res: Response) {
    const query = listPreventivePlansQuerySchema.parse(req.query);
    const result = await service.list(query);
    return res.status(200).json(result);
  }

  async findById(req: Request, res: Response) {
    const result = await service.findById(req.params.id);
    return res.status(200).json(result);
  }

  async create(req: Request, res: Response) {
    const data = createPreventivePlanSchema.parse(req.body);
    const result = await service.create(data);
    return res.status(201).json(result);
  }

  async update(req: Request, res: Response) {
    const data = updatePreventivePlanSchema.parse(req.body);
    const result = await service.update(req.params.id, data);
    return res.status(200).json(result);
  }

  async delete(req: Request, res: Response) {
    await service.delete(req.params.id);
    return res.status(204).send();
  }

  async generateNow(req: Request, res: Response) {
    const result = await service.generateWorkOrderNow(req.params.id, req.user!.id);
    return res.status(201).json(result);
  }
}

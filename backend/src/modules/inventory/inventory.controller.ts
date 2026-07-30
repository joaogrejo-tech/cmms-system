import { Request, Response } from 'express';
import { InventoryService } from './inventory.service';
import { createPartSchema, listPartsQuerySchema, stockMovementSchema, updatePartSchema } from './inventory.dto';

const service = new InventoryService();

export class InventoryController {
  async list(req: Request, res: Response) {
    const query = listPartsQuerySchema.parse(req.query);
    const result = await service.list(query);
    return res.status(200).json(result);
  }

  async findById(req: Request, res: Response) {
    const result = await service.findById(req.params.id);
    return res.status(200).json(result);
  }

  async create(req: Request, res: Response) {
    const data = createPartSchema.parse(req.body);
    const result = await service.create(data);
    return res.status(201).json(result);
  }

  async update(req: Request, res: Response) {
    const data = updatePartSchema.parse(req.body);
    const result = await service.update(req.params.id, data);
    return res.status(200).json(result);
  }

  async delete(req: Request, res: Response) {
    await service.delete(req.params.id);
    return res.status(204).send();
  }

  async registerMovement(req: Request, res: Response) {
    const data = stockMovementSchema.parse(req.body);
    const result = await service.registerMovement(req.params.id, data, req.user!.id);
    return res.status(201).json(result);
  }
}

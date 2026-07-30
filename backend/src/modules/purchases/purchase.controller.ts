import { Request, Response } from 'express';
import { PurchaseService } from './purchase.service';
import {
  createPurchaseOrderSchema,
  listPurchaseOrdersQuerySchema,
  updatePurchaseOrderSchema,
  updatePurchaseStatusSchema,
} from './purchase.dto';

const service = new PurchaseService();

export class PurchaseController {
  async list(req: Request, res: Response) {
    const query = listPurchaseOrdersQuerySchema.parse(req.query);
    const result = await service.list(query);
    return res.status(200).json(result);
  }

  async findById(req: Request, res: Response) {
    const result = await service.findById(req.params.id);
    return res.status(200).json(result);
  }

  async create(req: Request, res: Response) {
    const data = createPurchaseOrderSchema.parse(req.body);
    const result = await service.create(data, req.user!.id);
    return res.status(201).json(result);
  }

  async update(req: Request, res: Response) {
    const data = updatePurchaseOrderSchema.parse(req.body);
    const result = await service.update(req.params.id, data);
    return res.status(200).json(result);
  }

  async changeStatus(req: Request, res: Response) {
    const data = updatePurchaseStatusSchema.parse(req.body);
    const result = await service.changeStatus(req.params.id, data.status);
    return res.status(200).json(result);
  }
}

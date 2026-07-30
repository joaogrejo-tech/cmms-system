import { Request, Response } from 'express';
import { SupplierService } from './supplier.service';
import { createSupplierSchema, listSuppliersQuerySchema, updateSupplierSchema } from './supplier.dto';

const service = new SupplierService();

export class SupplierController {
  async list(req: Request, res: Response) {
    const query = listSuppliersQuerySchema.parse(req.query);
    return res.status(200).json(await service.list(query));
  }

  async findById(req: Request, res: Response) {
    return res.status(200).json(await service.findById(req.params.id));
  }

  async create(req: Request, res: Response) {
    const data = createSupplierSchema.parse(req.body);
    return res.status(201).json(await service.create(data));
  }

  async update(req: Request, res: Response) {
    const data = updateSupplierSchema.parse(req.body);
    return res.status(200).json(await service.update(req.params.id, data));
  }

  async delete(req: Request, res: Response) {
    await service.delete(req.params.id);
    return res.status(204).send();
  }
}

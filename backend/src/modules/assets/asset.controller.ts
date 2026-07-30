import { Request, Response } from 'express';
import { AssetService } from './asset.service';
import { addMeterReadingSchema, createAssetSchema, listAssetsQuerySchema, updateAssetSchema } from './asset.dto';

const service = new AssetService();

export class AssetController {
  async list(req: Request, res: Response) {
    const query = listAssetsQuerySchema.parse(req.query);
    const result = await service.list(query);
    return res.status(200).json(result);
  }

  async findById(req: Request, res: Response) {
    const result = await service.findById(req.params.id);
    return res.status(200).json(result);
  }

  async create(req: Request, res: Response) {
    const data = createAssetSchema.parse(req.body);
    const result = await service.create(data);
    return res.status(201).json(result);
  }

  async update(req: Request, res: Response) {
    const data = updateAssetSchema.parse(req.body);
    const result = await service.update(req.params.id, data);
    return res.status(200).json(result);
  }

  async delete(req: Request, res: Response) {
    await service.delete(req.params.id);
    return res.status(204).send();
  }

  async addMeterReading(req: Request, res: Response) {
    const data = addMeterReadingSchema.parse(req.body);
    const result = await service.addMeterReading(req.params.id, data.value, data.unit);
    return res.status(201).json(result);
  }
}

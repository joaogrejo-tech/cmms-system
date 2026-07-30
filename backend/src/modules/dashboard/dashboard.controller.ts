import { Request, Response } from 'express';
import { DashboardService } from './dashboard.service';
import { dashboardQuerySchema } from './dashboard.dto';

const service = new DashboardService();

export class DashboardController {
  async getSummary(req: Request, res: Response) {
    const query = dashboardQuerySchema.parse(req.query);
    const result = await service.getSummary(query);
    return res.status(200).json(result);
  }

  async getCostByAsset(_req: Request, res: Response) {
    const result = await service.getCostByAsset();
    return res.status(200).json(result);
  }
}

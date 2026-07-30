import { Request, Response } from 'express';
import { NotificationService } from './notification.service';

const service = new NotificationService();

export class NotificationController {
  async list(req: Request, res: Response) {
    const result = await service.list(req.user!.id, req.query as { page?: string; perPage?: string; unreadOnly?: string });
    return res.status(200).json(result);
  }

  async markAsRead(req: Request, res: Response) {
    const result = await service.markAsRead(req.params.id, req.user!.id);
    return res.status(200).json(result);
  }

  async markAllAsRead(req: Request, res: Response) {
    await service.markAllAsRead(req.user!.id);
    return res.status(204).send();
  }
}

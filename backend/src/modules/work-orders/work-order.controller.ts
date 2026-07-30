import { Request, Response } from 'express';
import { WorkOrderService } from './work-order.service';
import {
  addChecklistItemSchema,
  addCommentSchema,
  addLaborEntrySchema,
  addPartSchema,
  changeStatusSchema,
  createWorkOrderSchema,
  listWorkOrdersQuerySchema,
  toggleChecklistItemSchema,
  updateWorkOrderSchema,
} from './work-order.dto';
import { buildFileUrl } from '@/middlewares/upload';
import { AppError } from '@/shared/errors/AppError';

const service = new WorkOrderService();

export class WorkOrderController {
  async list(req: Request, res: Response) {
    const query = listWorkOrdersQuerySchema.parse(req.query);
    const result = await service.list(query);
    return res.status(200).json(result);
  }

  async findById(req: Request, res: Response) {
    const id = Number(req.params.id);
    const result = await service.findById(id);
    return res.status(200).json(result);
  }

  async create(req: Request, res: Response) {
    const data = createWorkOrderSchema.parse(req.body);
    const result = await service.create(data, req.user!.id);
    return res.status(201).json(result);
  }

  async update(req: Request, res: Response) {
    const id = Number(req.params.id);
    const data = updateWorkOrderSchema.parse(req.body);
    const result = await service.update(id, data);
    return res.status(200).json(result);
  }

  async changeStatus(req: Request, res: Response) {
    const id = Number(req.params.id);
    const data = changeStatusSchema.parse(req.body);
    const result = await service.changeStatus(id, data, req.user!.id);
    return res.status(200).json(result);
  }

  async delete(req: Request, res: Response) {
    const id = Number(req.params.id);
    await service.delete(id);
    return res.status(204).send();
  }

  async addComment(req: Request, res: Response) {
    const id = Number(req.params.id);
    const data = addCommentSchema.parse(req.body);
    const result = await service.addComment(id, req.user!.id, data.content);
    return res.status(201).json(result);
  }

  async addChecklistItem(req: Request, res: Response) {
    const id = Number(req.params.id);
    const data = addChecklistItemSchema.parse(req.body);
    const result = await service.addChecklistItem(id, data.description, data.order);
    return res.status(201).json(result);
  }

  async toggleChecklistItem(req: Request, res: Response) {
    const data = toggleChecklistItemSchema.parse(req.body);
    const result = await service.toggleChecklistItem(req.params.itemId, data.done);
    return res.status(200).json(result);
  }

  async addPart(req: Request, res: Response) {
    const id = Number(req.params.id);
    const data = addPartSchema.parse(req.body);
    const result = await service.addPart(id, data.partId, data.quantity, req.user!.id);
    return res.status(201).json(result);
  }

  async addLaborEntry(req: Request, res: Response) {
    const id = Number(req.params.id);
    const data = addLaborEntrySchema.parse(req.body);
    const result = await service.addLaborEntry(id, data.userId, data.hours, data.hourlyRate, data.date, data.notes);
    return res.status(201).json(result);
  }

  async uploadAttachment(req: Request, res: Response) {
    const id = Number(req.params.id);
    if (!req.file) {
      throw new AppError('Nenhum arquivo enviado.', 400);
    }
    const result = await service.addAttachment(id, req.user!.id, {
      fileName: req.file.originalname,
      fileUrl: buildFileUrl(req.file.filename),
      fileType: req.file.mimetype,
      fileSize: req.file.size,
    });
    return res.status(201).json(result);
  }
}

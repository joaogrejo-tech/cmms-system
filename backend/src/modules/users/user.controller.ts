import { Request, Response } from 'express';
import { UserService } from './user.service';
import { changePasswordSchema, createUserSchema, listUsersQuerySchema, updateUserSchema } from './user.dto';
import { ForbiddenError } from '@/shared/errors/AppError';

const service = new UserService();

export class UserController {
  async list(req: Request, res: Response) {
    const query = listUsersQuerySchema.parse(req.query);
    return res.status(200).json(await service.list(query));
  }

  async findById(req: Request, res: Response) {
    return res.status(200).json(await service.findById(req.params.id));
  }

  async create(req: Request, res: Response) {
    const data = createUserSchema.parse(req.body);
    return res.status(201).json(await service.create(data));
  }

  async update(req: Request, res: Response) {
    const data = updateUserSchema.parse(req.body);
    return res.status(200).json(await service.update(req.params.id, data));
  }

  async changePassword(req: Request, res: Response) {
    const data = changePasswordSchema.parse(req.body);
    const isAdmin = req.user!.role === 'ADMIN';
    const isSelf = req.user!.id === req.params.id;

    if (!isAdmin && !isSelf) {
      throw new ForbiddenError('Você só pode alterar sua própria senha.');
    }

    await service.changePassword(req.params.id, data, isAdmin && !isSelf);
    return res.status(204).send();
  }

  async delete(req: Request, res: Response) {
    await service.delete(req.params.id);
    return res.status(204).send();
  }
}

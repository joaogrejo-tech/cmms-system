import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { loginSchema, refreshSchema } from './auth.dto';
import { PERMISSION_MATRIX } from '@/middlewares/authorize';

const authService = new AuthService();

export class AuthController {
  async login(req: Request, res: Response) {
    const data = loginSchema.parse(req.body);
    const result = await authService.login(data);
    return res.status(200).json(result);
  }

  async refresh(req: Request, res: Response) {
    const data = refreshSchema.parse(req.body);
    const result = await authService.refresh(data.refreshToken);
    return res.status(200).json(result);
  }

  async logout(req: Request, res: Response) {
    const data = refreshSchema.parse(req.body);
    await authService.logout(data.refreshToken);
    return res.status(204).send();
  }

  async me(req: Request, res: Response) {
    return res.status(200).json({ user: req.user });
  }

  async permissions(req: Request, res: Response) {
    const role = req.user!.role;
    const allowed = Object.fromEntries(
      Object.entries(PERMISSION_MATRIX).map(([key, roles]) => [key, roles.includes(role)]),
    );
    return res.status(200).json({ role, permissions: allowed });
  }
}

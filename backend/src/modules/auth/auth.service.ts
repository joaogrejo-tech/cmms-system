import bcrypt from 'bcryptjs';
import { prisma } from '@/config/prisma';
import { addDays } from '@/shared/utils/date';
import { UnauthorizedError } from '@/shared/errors/AppError';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from './jwt';

interface LoginInput {
  email: string;
  password: string;
}

export class AuthService {
  async login({ email, password }: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.active) {
      throw new UnauthorizedError('Credenciais inválidas.');
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedError('Credenciais inválidas.');
    }

    const accessToken = signAccessToken({ sub: user.id, role: user.role, name: user.name });
    const refreshToken = signRefreshToken(user.id);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: addDays(new Date(), 7),
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        specialty: user.specialty,
      },
    };
  }

  async refresh(token: string) {
    let payload: { sub: string };
    try {
      payload = verifyRefreshToken(token);
    } catch {
      throw new UnauthorizedError('Refresh token inválido ou expirado.');
    }

    const stored = await prisma.refreshToken.findUnique({ where: { token } });
    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
      throw new UnauthorizedError('Sessão expirada. Faça login novamente.');
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.active) {
      throw new UnauthorizedError('Usuário inválido.');
    }

    const accessToken = signAccessToken({ sub: user.id, role: user.role, name: user.name });
    return { accessToken };
  }

  async logout(token: string) {
    await prisma.refreshToken.updateMany({
      where: { token },
      data: { revoked: true },
    });
  }
}

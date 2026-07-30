import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { AppError } from '@/shared/errors/AppError';
import { logger } from '@/config/logger';

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      message: error.message,
      details: error.details ?? null,
    });
  }

  if (error instanceof ZodError) {
    return res.status(422).json({
      message: 'Dados inválidos.',
      details: error.flatten().fieldErrors,
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        message: 'Já existe um registro com esses dados únicos.',
        details: error.meta,
      });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Registro não encontrado.' });
    }
  }

  logger.error({ err: error, path: req.path, method: req.method }, 'Erro não tratado');

  return res.status(500).json({
    message: 'Erro interno do servidor. Nossa equipe já foi notificada.',
  });
}

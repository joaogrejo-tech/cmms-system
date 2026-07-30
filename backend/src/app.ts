import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import path from 'path';
import { env } from '@/config/env';
import { logger } from '@/config/logger';
import { apiRoutes } from '@/routes';
import { errorHandler } from '@/middlewares/errorHandler';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.corsOrigin,
      credentials: true,
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(pinoHttp({ logger }));

  app.use(
    rateLimit({
      windowMs: env.rateLimit.windowMs,
      max: env.rateLimit.max,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  // Arquivos estáticos enviados (fotos de OS, manuais PDF etc.)
  app.use('/uploads', express.static(path.resolve(process.cwd(), env.upload.dir)));

  app.use('/api', apiRoutes);

  app.use(errorHandler);

  return app;
}

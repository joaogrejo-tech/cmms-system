import { PrismaClient } from '@prisma/client';
import { env } from './env';

declare global {
  // eslint-disable-next-line no-var
  var __prisma__: PrismaClient | undefined;
}

// Evita múltiplas instâncias em hot-reload durante desenvolvimento.
export const prisma =
  global.__prisma__ ??
  new PrismaClient({
    log: env.nodeEnv === 'development' ? ['warn', 'error'] : ['error'],
  });

if (env.nodeEnv === 'development') {
  global.__prisma__ = prisma;
}

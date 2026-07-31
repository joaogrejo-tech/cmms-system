import { createApp } from './app';
import { env } from '@/config/env';
import { logger } from '@/config/logger';
import { registerScheduledJobs } from '@/jobs/scheduledJobs';

const app = createApp();

app.listen(env.port, '0.0.0.0', () => {
  logger.info(`🚀 API do CMMS rodando na porta ${env.port}/api`);
  registerScheduledJobs();
});
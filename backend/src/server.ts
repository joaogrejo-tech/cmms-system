import { createApp } from './app';
import { env } from '@/config/env';
import { logger } from '@/config/logger';
import { registerScheduledJobs } from '@/jobs/scheduledJobs';

const app = createApp();

app.listen(env.port, () => {
  logger.info(`🚀 API do CMMS rodando em http://localhost:${env.port}/api`);
  registerScheduledJobs();
});

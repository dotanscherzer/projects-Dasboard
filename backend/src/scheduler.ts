import axios from 'axios';
import cron from 'node-cron';

type CronJobConfig = {
  name: string;
  schedule: string;
  endpoint: string;
};

const apiUrl = process.env.API_URL;
const internalSecret = process.env.INTERNAL_SECRET;

const jobs: CronJobConfig[] = [
  { name: 'health-sync', schedule: '*/5 * * * *', endpoint: '/internal/sync/health' },
  { name: 'deploy-sync', schedule: '*/15 * * * *', endpoint: '/internal/sync/deploys' },
  { name: 'db-health-sync', schedule: '0 * * * *', endpoint: '/internal/sync/db-health' },
  { name: 'automation-health-sync', schedule: '*/12 * * * *', endpoint: '/internal/sync/automation-health' },
  { name: 'metrics-cleanup', schedule: '0 2 * * *', endpoint: '/internal/sync/cleanup' },
];

const missingEnvWarning = () => {
  console.warn('[cron] API_URL and INTERNAL_SECRET must be set; skipping scheduler initialization');
};

const scheduleJob = (job: CronJobConfig) => {
  cron.schedule(job.schedule, async () => {
    try {
      await axios.post(
        `${apiUrl}${job.endpoint}`,
        {},
        {
          headers: {
            'X-Internal-Secret': internalSecret ?? '',
          },
        }
      );
      console.log(`[cron] ${job.name} completed successfully`);
    } catch (error: any) {
      console.error(`[cron] ${job.name} failed: ${error?.message ?? 'unknown error'}`);
    }
  });
};

export const startScheduler = (): void => {
  if (!apiUrl || !internalSecret) {
    missingEnvWarning();
    return;
  }

  jobs.forEach(scheduleJob);
  console.log('[cron] Scheduler initialized');
};


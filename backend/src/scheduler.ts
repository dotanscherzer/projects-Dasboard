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
    const startTime = new Date().toISOString();
    console.log(`[cron] ${job.name} started at ${startTime} (schedule: ${job.schedule})`);
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
      const endTime = new Date().toISOString();
      console.log(`[cron] ${job.name} completed successfully at ${endTime}`);
    } catch (error: any) {
      const endTime = new Date().toISOString();
      console.error(`[cron] ${job.name} failed at ${endTime}: ${error?.message ?? 'unknown error'}`);
    }
  });
};

export const startScheduler = (): void => {
  if (!apiUrl || !internalSecret) {
    missingEnvWarning();
    return;
  }

  console.log('[cron] ========================================');
  console.log('[cron] Scheduler Initializing...');
  console.log('[cron] API URL:', apiUrl);
  console.log('[cron] Scheduled Jobs:');
  jobs.forEach((job) => {
    console.log(`[cron]   - ${job.name}: ${job.schedule} (${getScheduleDescription(job.schedule)})`);
  });
  console.log('[cron] ========================================');

  jobs.forEach(scheduleJob);
  console.log('[cron] Scheduler initialized and running');
};

const getScheduleDescription = (schedule: string): string => {
  const descriptions: Record<string, string> = {
    '*/5 * * * *': 'Every 5 minutes',
    '*/12 * * * *': 'Every 12 minutes',
    '*/15 * * * *': 'Every 15 minutes',
    '0 * * * *': 'Every hour (at minute 0)',
    '0 2 * * *': 'Daily at 2:00 AM UTC',
  };
  return descriptions[schedule] || schedule;
};

